import { adminApiFetch } from '~~/server/utils/adminApiFetch';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'شناسه تیکت الزامی است',
    });
  }

  return await adminApiFetch(event, `/tickets/${id}`, {
    method: 'DELETE',
  });
});
