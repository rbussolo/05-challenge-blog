import { GetStaticProps, GetStaticPropsResult } from 'next';

import Head from 'next/head';
import Prismic from '@prismicio/client';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { api } from '../services/api';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: number;
  total_pages: number;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [nextPage, setNextPage] = useState<number>(1);
  const [posts, setPosts] = useState<Post[]>();

  useEffect(() => {
    setNextPage(postsPagination.next_page);
    setPosts(postsPagination.results);
  }, []);

  async function handleMorePosts(): Promise<void> {
    const response = await api.get(`/posts/${nextPage}`);
    const newPosts = response.data;

    setNextPage(nextPage + 1);
    setPosts(posts.concat(newPosts));
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={commonStyles.contentContainer}>
        {posts?.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <section className={styles.contentPost}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div className={styles.detailPost}>
                <div>
                  <img src="/images/calendar.svg" alt="calendario" />
                  <span>{post.first_publication_date}</span>
                </div>
                <div>
                  <img src="/images/user.svg" alt="autor" />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </section>
          </Link>
        ))}
        {postsPagination.total_pages >= nextPage ? (
          <button
            className={styles.morePosts}
            type="button"
            onClick={handleMorePosts}
          >
            Carregar mais posts
          </button>
        ) : null}
      </main>
    </>
  );
}

export const getStaticProps = async (): Promise<
  GetStaticPropsResult<HomeProps>
> => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const postPagination: PostPagination = {
    next_page: response.page + 1,
    total_pages: response.total_pages,
    results: response.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: moment(post.first_publication_date)
          .locale('pt-br')
          .format('DD MMM YYYY'),
        data: post.data,
      };
    }),
  };

  return {
    props: { postsPagination: postPagination },
  };
};
