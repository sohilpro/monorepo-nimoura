export default defineEventHandler(async (event) => {
  const { sortBy, ...query } = getQuery(event);
  const cleanQuery: Record<string, any> = { ...query };

  // DTOی اندپوینت محصولات فقط پارامتر «sort» را میپذیرد و با whitelist سختگیرانه،
  // هر پارامتر اضافی (از جمله «sortBy») را با خطای 400 رد میکند.
  // جدولهای پنل هر دو نام را میفرستند؛ اینجا فقط «sort» نگه میداریم و در صورت نبودن آن،
  // مقدار sortBy را به sort تبدیل میکنیم تا مرتبسازی از کار نیفتد.
  if (
    sortBy &&
    sortBy !== 'undefined' &&
    (!cleanQuery.sort || cleanQuery.sort === 'undefined')
  ) {
    cleanQuery.sort = sortBy;
  }

  if (cleanQuery.sort === 'undefined') delete cleanQuery.sort;
  if (cleanQuery.sortOrder === 'undefined') delete cleanQuery.sortOrder;
  if (cleanQuery.search === 'undefined') delete cleanQuery.search;

  return await adminApiFetch(event, '/products', {
    method: 'GET',
    query: cleanQuery,
  });
});
