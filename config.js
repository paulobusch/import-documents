module.exports = {
    Config: {
        idUser: 'oiyhjkmn',
        limit: 500,
    },
    MySqlConfig: {
        host: 'localhost',
        user: 'root',
        password: '123',
        database: 'vetorial'
    },
    Files: {
        input: 'documents',
        output: 'output'
    },
    Columns: {
        document: ['id', 'name', 'extension', 'size', 'description', 'id_customer', 'id_create_user', 'id_update_user', 'document_created', 'document_updated']
    }
}