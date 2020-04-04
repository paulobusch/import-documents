const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const { Config, Columns, Files } = require('../config');
const { Query } = require('./utils/query');
const { NewId } = require('./utils/random');
const { File } = require('./utils/file');

const mysql = require('sync-mysql');
const _ = require('lodash');

const async = async () => {
    console.log('Iniciando...');

    const files = await File.load();
    if (files.length === 0) {
        console.log('Nenhum arquivo para importar');
        return;
    }

    const connection = new mysql({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });
    const customerKfs = files.map(f => `'${f.kf_customer}'`).join(',');
    const queryCustomers = "select id, kf from customers where kf in (" + customerKfs + ")";
    const customers = await connection.query(queryCustomers);
    const getCustomerId = (customerKf) => {
        if (!customerKf) return null;
        const customer = customers.find(u => u.kf == customerKf);
        if (!customer) return null;
        return customer.id;
    };


    console.log('');
    console.log('===========================');
    console.log('Importando: ');

    const documents = [];
    for (let index in files) {
        const file = files[index];
        const document = {
            id: file.id,
            old_name: file.old_name,
            new_name: file.new_name,
            extension: file.extension,
            size: file.size,
            description: '[Documento importado]',
            customer_id: getCustomerId(file.kf_customer),
            id_create_user: Config.idUser,
            id_update_user: Config.idUser,
            document_created: new Date(),
            document_updated: new Date()
        };

        documents.push(document);
    }

    let partial = 0;
    while (partial * Config.limit < documents.length) {
        const offset = partial * Config.limit;
        console.log('Processando: ' + (offset + Config.limit) + ' / ' + documents.length);

        const partialImport = documents.slice(offset, offset + Config.limit);
        const DocumentRows = [];

        for (let index in partialImport) {
            const document = partialImport[index];
            DocumentRows.push([
                document.id,
                document.new_name,
                document.extension,
                document.size,
                document.description,
                document.customer_id,
                document.id_create_user,
                document.id_update_user,
                document.document_created,
                document.document_updated
            ]);
        }
        await connection.query(Query.get('documents', Columns.document, DocumentRows));

        for (let index in partialImport) {
            const document = partialImport[index];
            File.move(`${Files.input}\\${document.old_name}`, `${Files.output}\\${document.id + document.extension}`);
        }

        partial++;
    }

    console.log('Fim...');
}


async();