import supertest from 'supertest';
import Lighthouse from '../../service';
import mock from './mock.json';

let request: supertest.SuperTest<supertest.Test>;
const query = `
  query FetchScore($projectID: String!, $buildID: String!) {
    fetchScore(projectID: $projectID, buildID: $buildID) {
      performance
      accessibility
      bestPractices
      seo
      pwa
    }
}

query FetchProjectDetails($buildToken: String!){
  fetchProjectDetails(buildToken: $buildToken) {
    id
    token
    name
  }
}
`;

beforeAll(() => {
  request = supertest.agent(Lighthouse);
});
afterAll(() => Lighthouse.close());

describe('Lighthouse audit manager API Test', () => {
  it('List should fetch the score of lighthouse result', (done) => {
    request
      .post('/graphql')
      .send({
        query,
        operationName: 'FetchScore',
        variables: {
          projectID: mock.projectID,
          buildID: mock.buildID,
        },
      })
      .expect((res) => {
        expect(res.body).not.toHaveProperty('errors');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data.fetchScore[0]).toHaveProperty('performance');
        expect(res.body.data.fetchScore[0]).toHaveProperty('accessibility');
        expect(res.body.data.fetchScore[0]).toHaveProperty('bestPractices');
        expect(res.body.data.fetchScore[0]).toHaveProperty('seo');
        expect(res.body.data.fetchScore[0]).toHaveProperty('pwa');
      })
      .end((err) => {
        done(err);
      });
  });

  it('List should fetch the project ID', (done) => {
    request
      .post('/graphql')
      .send({
        query,
        operationName: 'FetchProjectDetails',
        variables: {
          buildToken: mock.buildToken,
        },
      })
      .expect((res) => {
        expect(res.body).not.toHaveProperty('errors');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data.fetchProjectDetails).toHaveProperty('id');
        expect(res.body.data.fetchProjectDetails).toHaveProperty('token');
        expect(res.body.data.fetchProjectDetails).toHaveProperty('name');
      })
      .end((err) => {
        done(err);
      });
  });
});
