import Prismic from '@prismicio/client';
import moment from 'moment';
import { NextApiRequest, NextApiResponse } from 'next';
import { getPrismicClient } from '../../../services/prismic';

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method === 'GET') {
    const { page } = req.query;

    const prismic = getPrismicClient();

    const response = await prismic.query(
      [Prismic.predicates.at('document.type', 'posts')],
      {
        fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
        pageSize: 10,
        page: page || 1,
      }
    );

    const posts = response.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: moment(post.first_publication_date)
          .locale('pt-br')
          .format('DD MMM YYYY'),
        data: post.data,
      };
    });

    return res.status(200).json(posts);
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).end('Method not allowed');
};
