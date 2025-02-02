/* Mock */
import supertest from 'supertest';
import UserGroup from '../../service';
import mock from './mock.json';

/* Supertest */

let request: supertest.SuperTest<supertest.Test>;
const query = `
  fragment userType on UserType {
      _id
      uid
      name
      title
  }

  query ListUsers {
    listUsers {
        ...userType
    }
  }

  mutation AddingUser($input: UserInput) {
      addUser(input: $input) {
          ...userType
      }
  }

  query getUsersBy($uid: String) {
    getUsersBy(uid: $uid) {
      ...userType
    }
  }

  mutation UpdatingUser($input: UserInput) {
      updateUser(input: $input) {
          ...userType
      }
  }

  mutation DeletingUser($_id: String!) {
      deleteUser(_id: $_id) {
          ...userType
      }
  }
`;

beforeAll(() => {
  request = supertest.agent(UserGroup);
});
afterAll(() => UserGroup.close());

describe('User-Group Microservice API Test', () => {
  it('should create a new User', (done) => {
    request
      .post('/graphql')
      .send({
        query,
        operationName: 'AddingUser',
        variables: {
          input: mock,
        },
      })
      .expect((res) => {
        expect(res.body).not.toHaveProperty('errors');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('addUser');
        expect(res.body.data.addUser).toHaveProperty('_id', mock._id);
        expect(res.body.data.addUser).toHaveProperty('uid', mock.uid);
        expect(res.body.data.addUser).toHaveProperty('name', mock.name);
      })
      .end((err) => {
        done(err);
      });
  });

  it('should get Users by uid', (done) => {
    request
      .post('/graphql')
      .send({
        query,
        operationName: 'getUsersBy',
        variables: {
          uid: mock.uid,
        },
      })
      .expect((res) => {
        expect(res.body).not.toHaveProperty('errors');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('getUsersBy');
        expect(res.body.data.getUsersBy).not.toHaveLength(0);
        expect(res.body.data.getUsersBy[0]).toHaveProperty('_id');
        expect(res.body.data.getUsersBy[0]).toHaveProperty('uid');
        expect(res.body.data.getUsersBy[0]).toHaveProperty('name');
      })
      .end((err) => {
        done(err);
      });
  });

  it('should list all Users', (done) => {
    request
      .post('/graphql')
      .send({
        query,
        operationName: 'ListUsers',
        variables: {
          uid: mock.uid,
        },
      })
      .expect((res) => {
        expect(res.body).not.toHaveProperty('errors');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('listUsers');
        expect(res.body.data.listUsers).not.toHaveLength(0);
        expect(res.body.data.listUsers[0]).toHaveProperty('_id');
        expect(res.body.data.listUsers[0]).toHaveProperty('uid');
        expect(res.body.data.listUsers[0]).toHaveProperty('name');
      })
      .end((err) => {
        done(err);
      });
  });

  it('should update the User', (done) => {
    request
      .post('/graphql')
      .send({
        query,
        operationName: 'UpdatingUser',
        variables: {
          input: mock,
        },
      })
      .expect((res) => {
        expect(res.body).not.toHaveProperty('errors');
        expect(res.body).toHaveProperty('data');

        expect(res.body.data).toHaveProperty('updateUser');
        expect(res.body.data.updateUser).toHaveProperty('_id', mock._id);
        expect(res.body.data.updateUser).toHaveProperty('uid', mock.uid);
        expect(res.body.data.updateUser).toHaveProperty('name', mock.name);
      })
      .end((err) => {
        done(err);
      });
  });

  it('should delete the user', (done) => {
    request
      .post('/graphql')
      .send({
        query,
        operationName: 'DeletingUser',
        variables: {
          _id: mock._id,
        },
      })
      .expect((res) => {
        expect(res.body).not.toHaveProperty('errors');
        expect(res.body).toHaveProperty('data');

        expect(res.body.data).toHaveProperty('deleteUser');
        expect(res.body.data.deleteUser).toHaveProperty('_id', mock._id);
        expect(res.body.data.deleteUser).toHaveProperty('uid', mock.uid);
        expect(res.body.data.deleteUser).toHaveProperty('name', mock.name);
      })
      .end((err) => {
        done(err);
      });
  });
});
