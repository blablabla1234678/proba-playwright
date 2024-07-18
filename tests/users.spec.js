import { test, expect } from '@playwright/test';
import usersFixture from './users.json';
import {publicUserData, getUserWithToken } from './helpers';

test('should list empty users collection', async ({ request }) => {
    const response = await request.get('users');
    expect(response.status()).toBe(200);
    const users = await response.json();
    expect(users).toEqual([]);
});

test('can create and list users', async ({ request }) => {
    const usersData = Object.values(usersFixture);
    for (let userData of usersData){
        let response = await request.post('users', {data: userData});
        expect(response.status()).toBe(201);
        let user = await response.json();
        expect(user).toEqual(expect.objectContaining(publicUserData(userData)));
    }
    let response = await request.get('users');
    expect(response.status()).toBe(200);
    const users = await response.json();
    expect(users).toHaveLength(usersData.length);
    for (let index = 0; index<usersData.length; ++index)
        expect(users[index]).toEqual(expect.objectContaining(publicUserData(usersData[index])));
});

test('can read and delete an user', async ({ request }) => {
    const user = await getUserWithToken(request, 'user1b');
    
    let response = await request.get(`users/${user.id}`);
    expect(response.status()).toBe(200);
    let body = await response.json();
    expect(body).toEqual(expect.objectContaining(publicUserData(usersFixture.user1b)));

    response = await request.delete(`users/${user.id}`, {
        headers: {
            authorization: 'Bearer ' + user.token.plainText
        }
    });
    expect(response.status()).toBe(200);

    response = await request.get(`users/${user.id}`);
    expect(response.status()).toBe(404);
});

test('can update an user', async ({ request }) => {
    const user = await getUserWithToken(request, 'user1');
    
    let response = await request.get(`users/${user.id}`);
    expect(response.status()).toBe(200);
    let body = await response.json();
    expect(body).toEqual(expect.objectContaining(publicUserData(usersFixture.user1)));

    response = await request.put(`users/${user.id}`, {
        headers: {
            authorization: 'Bearer ' + user.token.plainText
        },
        data: usersFixture.user1b
    });
    expect(response.status()).toBe(200);

    response = await request.get(`users/${user.id}`);
    expect(response.status()).toBe(200);
    body = await response.json();
    expect(body).toEqual(expect.objectContaining(publicUserData(usersFixture.user1b)));
});