var db = require('./../db/mysql')
var crypto = require('crypto');

var exports = module.exports = {}

function hash(input)
{
  return crypto.createHash('sha1').update(input).digest('hex');
}

exports.authenticate = async function authenticate(emailAddress, password) {
  let conn = new db.Users()
  conn.begin()
  let res = await conn.getSalt(emailAddress)
  if (res.length == 0)
  {
    conn.end()
    return new Error('Email address not found')
  }
  var obj = await conn.authenticateUser(emailAddress, hash(res[0].salt + '' + password))
  conn.end()

  if (obj.length == 0)
    return new Error('Incorrect password')

  return obj
}

exports.add = async function add(newUser) {
  var salt = crypto.randomBytes(20).toString('hex');

  var conn = new db.Users()
  var obj = {}
  try {
    conn.begin()
    obj = await conn.insert(
      newUser.firstName,
      newUser.secondName,
      newUser.emailAddress,
      newUser.isAdmin,
      hash(salt + '' + newUser.password),
      salt
    )
  } catch (e) {
    console.log(e)
    throw e
  } finally {
    conn.end()
  }

  return await get({id: obj.insertId})
}

async function get(user) {
  var names = ['id', 'firstName', 'secondName', 'emailAddress', 'isAdmin', 'passwordHash']
  var values = [user.id, user.firstName, user.secondName, user.emailAddress, user.isAdmin, user.passwordHash]

  var conn = new db.Users()
  var obj = {}
  try {
    conn.begin()
    obj = await conn.select(names, values)
  }
  catch (e) {
    console.log(e)
    throw e
  }
  finally {
    conn.end()
  }
  return obj
}
exports.get = get;