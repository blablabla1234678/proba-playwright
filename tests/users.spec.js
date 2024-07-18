import { test, expect } from '@playwright/test';
import usersData from './users.json';

test('should list empty users collection', async ({ request }) => {
    const response = await request.get('users');
    expect(response.ok()).toBeTruthy();
    const users = await response.json();
    expect(await users).toEqual([]);
});