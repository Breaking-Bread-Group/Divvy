const request = require('supertest');
const assert = require('assert');

// Use the existing server
const BASE_URL = 'http://localhost:8080';

// Test data
const TEST_USERS = [
  {
    email: 'test1@example.com',
    password: 'password123',
    first_name: 'Test',
    last_name: 'User1'
  },
  {
    email: 'test2@example.com',
    password: 'password123',
    first_name: 'Test',
    last_name: 'User2'
  },
  {
    email: 'test3@example.com',
    password: 'password123',
    first_name: 'Test',
    last_name: 'User3'
  }
];

async function registerUser(user) {
  const response = await request(BASE_URL)
    .post('/api/register')
    .send(user);
  
  if (response.status !== 201) {
    throw new Error(`Registration failed: ${JSON.stringify(response.body)}`);
  }
  return response;
}

async function loginUser(email, password) {
  const response = await request(BASE_URL)
    .post('/api/login')
    .send({ email, password });
  
  if (response.status !== 200) {
    throw new Error(`Login failed: ${JSON.stringify(response.body)}`);
  }
  return response;
}

async function testGroups() {
  try {
    // Step 1: Register test users
    console.log('Step 1: Registering test users...');
    for (const user of TEST_USERS) {
      await registerUser(user);
      console.log(`Registered user: ${user.email}`);
    }

    // Step 2: Login as first user
    console.log('\nStep 2: Logging in as first user...');
    const loginResponse = await loginUser(TEST_USERS[0].email, TEST_USERS[0].password);
    const sessionCookie = loginResponse.headers['set-cookie'];
    console.log('Logged in successfully');

    // Step 3: Create a group with email-based members
    console.log('\nStep 3: Creating a group with email-based members...');
    const createGroupResponse = await request(BASE_URL)
      .post('/api/groups')
      .set('Cookie', sessionCookie)
      .send({
        title: 'Test Group',
        memberEmails: [TEST_USERS[1].email, TEST_USERS[2].email]
      });

    assert.strictEqual(createGroupResponse.status, 201, 'Group creation should succeed');
    const groupId = createGroupResponse.body.groupId;
    console.log('Group created successfully:', createGroupResponse.body);

    // Step 4: Get the created group and verify members
    console.log('\nStep 4: Fetching and verifying group details...');
    const getGroupResponse = await request(BASE_URL)
      .get(`/api/groups/${groupId}`)
      .set('Cookie', sessionCookie);

    assert.strictEqual(getGroupResponse.status, 200, 'Should fetch group successfully');
    assert.strictEqual(getGroupResponse.body.members.length, 3, 'Group should have 3 members (creator + 2 added)');
    console.log('Group details verified:', getGroupResponse.body);

    // Step 5: Add more members to the group
    console.log('\nStep 5: Adding more members to the group...');
    const addMembersResponse = await request(BASE_URL)
      .post(`/api/groups/${groupId}/members`)
      .set('Cookie', sessionCookie)
      .send({
        memberEmails: [TEST_USERS[0].email] // Try to add creator again (should be ignored)
      });

    assert.strictEqual(addMembersResponse.status, 201, 'Should add members successfully');
    console.log('Members added successfully');

    // Step 6: Verify updated member list
    console.log('\nStep 6: Verifying updated member list...');
    const updatedGroupResponse = await request(BASE_URL)
      .get(`/api/groups/${groupId}`)
      .set('Cookie', sessionCookie);

    assert.strictEqual(updatedGroupResponse.status, 200, 'Should fetch updated group successfully');
    assert.strictEqual(updatedGroupResponse.body.members.length, 3, 'Group should still have 3 members (no duplicates)');
    console.log('Updated group details verified');

    // Step 7: Try to add members as non-creator (should fail)
    console.log('\nStep 7: Testing non-creator member addition...');
    const secondUserLogin = await loginUser(TEST_USERS[1].email, TEST_USERS[1].password);
    const secondUserCookie = secondUserLogin.headers['set-cookie'];

    const unauthorizedAddResponse = await request(BASE_URL)
      .post(`/api/groups/${groupId}/members`)
      .set('Cookie', secondUserCookie)
      .send({
        memberEmails: [TEST_USERS[0].email]
      });

    assert.strictEqual(unauthorizedAddResponse.status, 403, 'Non-creator should not be able to add members');
    console.log('Unauthorized member addition prevented');

    // Step 8: Delete the group
    console.log('\nStep 8: Deleting the group...');
    const deleteGroupResponse = await request(BASE_URL)
      .delete(`/api/groups/${groupId}`)
      .set('Cookie', sessionCookie);

    assert.strictEqual(deleteGroupResponse.status, 200, 'Should delete group successfully');
    console.log('Group deleted successfully');

    // Step 9: Verify group is deleted
    console.log('\nStep 9: Verifying group is deleted...');
    const verifyDeleteResponse = await request(BASE_URL)
      .get(`/api/groups/${groupId}`)
      .set('Cookie', sessionCookie);

    assert.strictEqual(verifyDeleteResponse.status, 404, 'Group should not exist after deletion');
    console.log('Group deletion verified');

    // Step 10: Clean up test users
    console.log('\nStep 10: Cleaning up test users...');
    for (const user of TEST_USERS) {
      const userLogin = await loginUser(user.email, user.password);
      const userCookie = userLogin.headers['set-cookie'];
      
      await request(BASE_URL)
        .delete('/api/users/me')
        .set('Cookie', userCookie);
      
      console.log(`Deleted user: ${user.email}`);
    }

    console.log('\nAll tests passed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testGroups(); 