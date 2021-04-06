import { GetStaticProps, GetStaticPropsResult } from 'next';

import Head from 'next/head';
import Prismic from '@prismicio/client';
import moment from 'moment';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={styles.contentContainer}>
        {postsPagination.results.map(post => (
          <section key={post.uid} className={styles.contentPost}>
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
        ))}
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
      pageSize: 10,
    }
  );

  const postsPagination: PostPagination = {
    next_page: String(response.page + 1),
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
    props: { postsPagination },
  };
};
