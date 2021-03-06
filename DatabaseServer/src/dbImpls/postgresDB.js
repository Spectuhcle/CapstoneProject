const pg = require('pg');

var config = {
    user: 'postgres',
    database: 'Capstone',
    password: 'password123',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
};

const pool = new pg.Pool(config);

async function select (query) {
    const client = await pool.connect();
    let res;
    try {
        res = await client.query(query)
            .catch(err => {
                console.log(err);
            });
    } finally {
        client.release();
    }
    return res.rows;
}

async function insertInto (query) {
    const client = await pool.connect();
	try {
        await client.query(query)
            .catch(err => {
                console.log(err);
            });
	} finally {
		client.release();
	}
}

async function deleteFrom (query) {
    const client = await pool.connect();
	try {
        await client.query(query)
            .catch(err => {
                
            });
	} finally {
		client.release();
	}
}

async function getUsers () {
    const query = 'SELECT "username", "password", "lastName", "firstName", "email" FROM public."UserInfo";';
    return await select(query);
}

async function getUserById (id) {
    const query = 'SELECT "username", "password", "lastName", "firstName", "email" FROM public."UserInfo" WHERE "id" = ' + id + ';';
    let res = await select(query);
    return res[0];
}

async function addUser (user) {
    let dbUser = await getUserById(user.id);
    if (dbUser === undefined) {
        const query = 'INSERT INTO public."UserInfo"("id", "username", "password", "lastName", "firstName", "email") VALUES (' + user.id + ' , \'' + user.username + '\' , \'' + user.password + '\' , \'' + user.lastName + '\' , \'' + user.firstName + '\' , \'' + user.email + '\');';
        await insertInto(query);
        return {
            success: true,
            id: user.id
        };
    }
    return {
        success: false,
        reason: 409
    };
}

async function deleteUser (id) {
    const query = 'DELETE FROM public."UserInfo" WHERE "id" = ' + id + ';';
    await deleteFrom(query);
}

async function deleteAllUsers () {
    const query = 'DELETE FROM public."UserInfo";';
    await deleteFrom(query);
}

async function areValidCredentials (credentials) {
    const query = 'SELECT "password" FROM public."UserInfo" WHERE "username" = \'' + credentials.username + '\';';
    let res = await select(query);
    return res[0].password === credentials.password;
}

async function getGames () {
    const query = 'SELECT id, "timeStarted", users, results, "timeLasted" FROM public."GameInfo";';
    return await select(query);
}

async function getGameById (id) {
    const query = 'SELECT "timeStarted", users, results, "timeLasted" FROM public."GameInfo" WHERE "id" = ' + id + ';';
    let res = await select(query);
    return res[0];
}

async function addGame (game) {
    let dbUser = await getGameById(game.id);
    if (dbUser === undefined) {
        const query = 'INSERT INTO public."GameInfo"("id", "timeStarted", "users", "results", "timeLasted") VALUES (' + game.id + ' , \'' + game.timeStarted + '\' , \'{' + game.users + '}\' , \'{' + game.results + '}\' , \'{' + game.timeLasted + '}\');';
		await insertInto(query);
        return {
            success: true,
            id: game.id
        };
    }
    return {
        success: false,
        reason: 409
    };
}

async function deleteGame (id) {
    const query = 'DELETE FROM public."GameInfo" WHERE "id" = ' + id + ';';
    await deleteFrom(query);
	return {success: true};
}

async function deleteAllGames () {
    const query = 'DELETE FROM public."GameInfo";';
    await deleteFrom(query);
	return {success: true};
}

exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.addUser = addUser;
exports.deleteUser = deleteUser;
exports.deleteAllUsers = deleteAllUsers;

exports.areValidCredentials = areValidCredentials;

exports.getGames = getGames;
exports.getGameById = getGameById;
exports.addGame = addGame;
exports.deleteGame = deleteGame;
exports.deleteAllGames = deleteAllGames;