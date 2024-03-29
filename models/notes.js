var db = require('./../db/mysql')

var exports = module.exports = {}

async function add(note) {
    var conn = new db.Notes()
    var obj = {}
    try {
        conn.begin()
        obj = await conn.insert(
            note.note,
            note.userId,
            note.contactId)
    } catch (e) {
        console.log(e)
        throw e
    } finally {
        conn.end()
    }

    return await get({id: obj.insertId})
}
exports.add = add;

async function get(note) {
    var values = [note.id, note.contactId, note.userId, note.note, note.updatedAt, note.isDeleted]

    var conn = new db.Notes()
    var obj = {}
    try {
        conn.begin()
        obj = await conn.select({whereValues: values})
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
