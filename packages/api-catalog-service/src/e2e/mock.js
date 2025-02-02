module.exports = {
  id: '6167ba700ae8f84a2ebfadb9',
  name: 'Petstore',
  slug: 'petstore',
  description: 'Petstore',
  category: 'REST',
  tags: [
    'rest',
    'one',
  ],
  owners: [
    {
      email: 'oommachan@redhat.com',
      group: 'USER',
    },
    {
      email: 'rigin@redhat.com',
      group: 'USER',
    },
  ],
  schemaEndpoint: 'https://petstore.swagger.io/v2/swagger.json',
  headers: {
    key: 'Content-Type',
    value: 'application/json',
  },
  appUrl: 'https://petstore.redhat.com',
  environments: [
    {
      name: 'production',
      apiBasePath: 'https://petstore.swagger.io/v2/swagger.json',
    },
  ],
  createdBy: '7ab20a62-0d75-11e7-ae22-28d244ea5a6d',
};
