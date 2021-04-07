import { GetStaticProps, GetStaticPropsResult } from 'next';

import Head from 'next/head';
import Prismic from '@prismicio/client';
import moment from 'moment';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [nextPage, setNextPage] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>();

  useEffect(() => {
    setNextPage(postsPagination.next_page);
    setPosts(postsPagination.results);
  }, []);

  async function handleMorePosts(): Promise<void> {
    if (nextPage) {
      const dataResponse = await fetch(nextPage).then(async response => {
        const d = await response.json().then(data => {
          return data;
        });

        return d;
      });

      const newPostPagination: PostPagination = {
        next_page: dataResponse.next_page,
        results: dataResponse.results,
      };

      setNextPage(newPostPagination.next_page);
      setPosts([...posts, ...newPostPagination.results]);
    }
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <Header />

      <main className={commonStyles.contentContainer}>
        {posts?.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <section className={styles.contentPost}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div className={styles.detailPost}>
                <div>
                  <img src="/images/calendar.svg" alt="calendario" />
                  <span>
                    {moment(post.first_publication_date)
                      .locale('pt-br')
                      .format('DD MMM YYYY')}
                  </span>
                </div>
                <div>
                  <img src="/images/user.svg" alt="autor" />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </section>
          </Link>
        ))}
        {nextPage ? (
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
    next_page: response.next_page,
    results: response.results,
  };

  return {
    props: { postsPagination: postPagination },
  };
};
