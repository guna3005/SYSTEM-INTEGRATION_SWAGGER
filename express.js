const express = require('express');
const mariadb = require('mariadb');

const app = express();

const { body, validationResult, param } = require('express-validator');


const port = 3000;

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'A REST API documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./express.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: Retrieve a list of all agents
 *     responses:
 *       200:
 *         description: A list of agents from the database
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agent'
 *       500:
 *         description: Failed to fetch agents
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Retrieve a customer by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer's ID
 *     responses:
 *       200:
 *         description: A customer object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Failed to fetch customer
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Retrieve a list of all companies
 *     responses:
 *       200:
 *         description: A list of companies from the database
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 *       500:
 *         description: Failed to fetch companies
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Retrieve orders optionally filtered by minimum amount
 *     parameters:
 *       - in: query
 *         name: min_amount
 *         schema:
 *           type: number
 *         required: false
 *         description: Minimum amount of order to filter by
 *     responses:
 *       200:
 *         description: A list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Failed to fetch orders
 */

/**
 * @swagger
 * /api/agents:
 *   post:
 *     summary: Add a new agent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Agent'
 *     responses:
 *       201:
 *         description: Agent added
 *       500:
 *         description: Failed to add agent
 */

/**
 * @swagger
 * /api/agents/{id}:
 *   patch:
 *     summary: Update an agent's commission
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent's ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               COMMISSION:
 *                 type: number
 *                 description: New commission value
 *     responses:
 *       200:
 *         description: Agent's commission updated
 *       500:
 *         description: Failed to update agent
 */

/**
 * @swagger
 * /api/agents/{id}:
 *   put:
 *     summary: Replace an agent's data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent's ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Agent'
 *     responses:
 *       200:
 *         description: Agent replaced
 *       500:
 *         description: Failed to replace agent
 */

/**
 * @swagger
 * /api/agents/{id}:
 *   delete:
 *     summary: Remove an agent
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The agent's ID
 *     responses:
 *       200:
 *         description: Agent deleted successfully
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Failed to delete agent
 */



const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'sample',
    port: 3306,
    connectionLimit: 5
});

app.use(express.json());

app.get('/api/agents', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const result = await conn.query("SELECT * FROM agents");
        conn.release();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to fetch agents.");
    }
});

app.get('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await pool.getConnection();
        const result = await conn.query("SELECT * FROM customer WHERE CUST_CODE = ?", [id]);
        conn.release();
        if (result.length) {
            res.json(result[0]);
        } else {
            res.status(404).send("Customer not found.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to fetch customer.");
    }
});

app.get('/api/companies', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const result = await conn.query("SELECT * FROM company");
        conn.release();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to fetch companies.");
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const { min_amount } = req.query;
        const conn = await pool.getConnection();
        const query = min_amount ? 
            "SELECT * FROM orders WHERE ORD_AMOUNT >= ?" : 
            "SELECT * FROM orders";
        const result = await conn.query(query, [min_amount]);
        conn.release();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to fetch orders.");
    }
});


app.post('/api/agents', [
  body('AGENT_CODE').isLength({ min: 1 }).trim().escape(),
  body('AGENT_NAME').isAlpha().trim().escape(),
  body('WORKING_AREA').isAlpha().trim().escape(),
  body('COMMISSION').isFloat(),
  body('PHONE_NO').isMobilePhone(),
  body('COUNTRY').optional().isAlpha().trim().escape(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = req.body;
    const conn = await pool.getConnection();
    const result = await conn.query("INSERT INTO agents (AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY) VALUES (?, ?, ?, ?, ?, ?)", [AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY]);
    conn.release();
    res.status(201).send("Agent added.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add agent.");
  }
});

app.patch('/api/agents/:id', [
    body('COMMISSION').isFloat(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { id } = req.params;
      const { COMMISSION } = req.body;
      const conn = await pool.getConnection();
      const result = await conn.query("UPDATE agents SET COMMISSION = ? WHERE AGENT_CODE = ?", [COMMISSION, id]);
      conn.release();
      res.send("Agent's commission updated.");
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to update agent.");
    }
  });

app.put('/api/agents/:id', [
    body('AGENT_NAME').isAlpha().trim().escape(),
    body('WORKING_AREA').isAlpha().trim().escape(),
    body('COMMISSION').isFloat(),
    body('PHONE_NO').isMobilePhone(),
    body('COUNTRY').optional().isAlpha().trim().escape(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { id } = req.params;
      const { AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = req.body;
      const conn = await pool.getConnection();
      const result = await conn.query("UPDATE agents SET AGENT_NAME = ?, WORKING_AREA = ?, COMMISSION = ?, PHONE_NO = ?, COUNTRY = ? WHERE AGENT_CODE = ?", [AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY, id]);
      conn.release();
      res.send("Agent replaced.");
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to replace agent.");
    }
  });

  app.delete('/api/agents/:id', [
    param('id').isAlphanumeric().trim().escape()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { id } = req.params;
      const conn = await pool.getConnection();
      const result = await conn.query("DELETE FROM agents WHERE AGENT_CODE = ?", [id]);
      conn.release();
      if (result.affectedRows > 0) {
        res.send("Agent deleted successfully.");
      } else {
        res.status(404).send("Agent not found.");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to delete agent.");
    }
  });
    


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
