const connection = require('../database/connection');

module.exports = {
    async store(req, res) {
        try {
            const { data } = req.body;
            
            const [ id ] = await connection('doctors').insert(data);
            
            return res.json({ status: true, response: id });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async update(req, res) {
        try {
            const { data } = req.body, { id } = req.params;
            
            const query = await connection('doctors')
                .where({ id })
                .update(data);
            
            return res.json({ status: true, response: query });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async index(req, res) {
        try {
            const { page = 1 } = req.query;
    
            const [count] = await connection('doctors').count();
    
            const query = await connection('doctors')
            .limit(10)
            .offset((page - 1) * 10)
            .orderBy('name', 'asc');
    
            return res.json({status: true, response: query, count});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async indexByName(req, res) {
        try {
            const { name } = req.query;
    
            const query = await connection('doctors')
            .where('name', 'like', name)
            .limit(1);
    
            return res.json({status: true, response: query});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async show(req, res) {
        try {
            const { id } = req.params;
    
            const [query] = await connection('doctors')
            .where({ id })
            .limit(1);
    
            return res.json({status: true, response: query});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            
            const query = await connection('doctors')
            .where({ id })
            .delete();

            return res.json({status: true, response: query});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    }
}