import { test, expect } from '@playwright/test';
import postsFixture from './posts.json';
import { getUserWithToken, getPost } from './helpers';

test('can create and list posts', async ({request}) => {
    const users = {};
    users.user1 = await getUserWithToken(request, 'user1');
    users.user2 = await getUserWithToken(request, 'user2');

    const ownership = {
        user1: ['post1', 'post1b'],
        user2: ['post2']
    };
    for (let userName in ownership)
        for (let postName of ownership[userName]){
            let response = await request.post('posts', {
                data: postsFixture[postName],
                headers: {
                    authorization: 'Bearer '+users[userName].token.plainText
                }
            });
            expect(response.status()).toBe(201);
        }

    let response = await request.get('posts');
    expect(response.status()).toBe(200);
    let posts = await response.json();
    expect(posts).toHaveLength(3);
    const postsData = Object.values(postsFixture);
    for (let index = 0; index<postsData.length; ++index)
        expect(posts[index]).toEqual(expect.objectContaining(postsData[index]));
});


test('can list posts by the owner', async ({request}) => {
    const user = await getUserWithToken(request, 'user1');
    
    const response = await request.get(`users/${user.id}/posts`);
    expect(response.status()).toBe(200);
    const usersPosts = await response.json();
    expect(usersPosts).toHaveLength(2);
    expect(usersPosts[0]).toEqual(expect.objectContaining(postsFixture.post1));
    expect(usersPosts[1]).toEqual(expect.objectContaining(postsFixture.post1b));
});

test('can read and delete posts', async ({request}) => {
    const user = await getUserWithToken(request, 'user1');
    const post = await getPost(request, 'post1b');

    let response = await request.get(`posts/${post.id}`);
    expect(response.status()).toBe(200);
    let body = await response.json();
    expect(body).toEqual(expect.objectContaining(postsFixture.post1b));

    response = await request.delete(`posts/${post.id}`, {
        headers: {
            authorization: 'Bearer '+user.token.plainText
        }
    });
    expect(response.status()).toBe(200);

    response = await request.get(`posts/${post.id}`);
    expect(response.status()).toBe(404);
});

test('can update a post', async ({request}) => {
    const user = await getUserWithToken(request, 'user1');
    const post = await getPost(request, 'post1');

    let response = await request.get(`posts/${post.id}`);
    expect(response.status()).toBe(200);
    let body = await response.json();
    expect(body).toEqual(expect.objectContaining(postsFixture.post1));

    response = await request.put(`posts/${post.id}`, {
        data: postsFixture.post1b,
        headers: {
            authorization: 'Bearer '+user.token.plainText
        }
    });
    expect(response.status()).toBe(200);
    body = await response.json();
    expect(body).toEqual(expect.objectContaining(postsFixture.post1b));

    response = await request.get(`posts/${post.id}`);
    expect(response.status()).toBe(200);
    body = await response.json();
    expect(body).toEqual(expect.objectContaining(postsFixture.post1b));
});