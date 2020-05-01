const connection = require('../database/connection');

module.exports = {
    async store(req, res) {
        try {
            const { data } = req.body;

            const [ id ] = await connection('appointments').insert(data);
            
            return res.json({ status: true, response: id });
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async update(req, res) {
        try {
            const { data } = req.body, { id } = req.params;

            const query = await connection('appointments')
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
    
            const [count] = await connection('appointments').count();
    
            const query = await connection('appointments')
            .limit(10)
            .offset((page - 1) * 10)
    
            return res.json({status: true, response: query, count});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async indexByDate(req, res) {
        try {
            let { start, end, doctorId, page } = req.query, query = null, limit = 10, count = 10;

            if(doctorId) {
                [count] = await connection('appointments')
                    .count()
                    .whereBetween('date', [start, end])
                    .where({ doctorId });

                if(!page) {
                    page = 1;
                    limit = count['count(*)'];
                }

                query = await connection('appointments')
                    .whereBetween('date', [start, end])
                    .where({ doctorId })
                    .join('doctors', 'doctors.id', '=', 'appointments.doctorId')
                    .select(['appointments.*', 'doctors.name as doctorName'])
                    .limit(limit)
                    .offset((page - 1) * 10)
                    .orderBy('date', 'asc');
            }
            else {
                [count] = await connection('appointments')
                    .count()
                    .whereBetween('date', [start, end])

                if(!page) {
                    page = 1;
                    limit = count['count(*)'];
                }

                query = await connection('appointments')
                    .whereBetween('date', [start, end])
                    .join('doctors', 'doctors.id', '=', 'appointments.doctorId')
                    .select(['appointments.*', 'doctors.name as doctorName'])
                    .limit(limit)
                    .offset((page - 1) * 10)
                    .orderBy('date', 'asc');
            }
    
            return res.json({status: true, response: query, count});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    },

    async show(req, res) {
        try {
            const { id } = req.params;
    
            const [query] = await connection('appointments')
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
            
            const query = await connection('appointments')
            .where({ id })
            .delete();

            return res.json({status: true, response: query});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, response: error });
        }
    }
}