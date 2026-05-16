export const createUser = (data) => ({
  id:        data.id        || null,
  firstName: data.firstName || '',
  lastName:  data.lastName  || '',
  email:     data.email     || '',
  role:      data.role      || 'User',
  token:     data.token     || '',
});
