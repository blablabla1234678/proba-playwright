import usersFixture from './users.json';
const usersWithTokens = {};

export async function getUserWithToken(request, name){
    if (usersWithTokens[name])
        return usersWithTokens[name];
    const user = await getUserByFixtureName(request, name);
    const token = await createToken(request, name);
    user.token = token;
    usersWithTokens[name] = user;
    return user;
}

async function getUserByFixtureName(request, name){
    const data = usersFixture[name];
    let response = await request.get('users');
    const users = await response.json();
    for (let user of users)
        if (user.email == data.email)
            return user;
}

async function createToken(request, name){
    const data = usersFixture[name];
    let response = await request.post('tokens', {
        data: {email: data.email, password: data.password}
    });
    const token = await response.json();
    return token;
}

export function publicUserData(userData){
    return only(userData, ['name', 'email']);
}

function only(object, properties){
    const result = {};
    for (let property of properties)
        result[property] = object[property];
    return result;
}
