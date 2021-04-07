import Head from 'next/head';
import moment from 'moment';
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />

      <img
        className={styles.contentBanner}
        src={post.data.banner.url}
        alt="banner"
      />
      <main
        className={`${commonStyles.contentContainer} ${styles.contentPost}`}
      >
        <h1>{post.data.title}</h1>
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
          <div>
            <img src="/images/clock.svg" alt="relogio" />
            <span>4 min</span>
          </div>
        </div>

        {post.data.content.map(c => (
          <div key={c.heading} className={styles.bodyPost}>
            <h2>{c.heading}</h2>
            <div className={styles.postContent}>
              {c.body.map(b => (
                <p key={b.text}>{b.text}</p>
              ))}
            </div>
          </div>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title'],
      pageSize: 10,
    }
  );

  const paths = response.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const post: Post = response;

  return {
    props: { post },
    redirect: 60 * 30, // 30 minutes
  };
};
