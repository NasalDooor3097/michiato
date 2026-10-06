import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import pedidosRouter from './routes/pedidos.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const mesasPath = path.resolve('./mesas.json');


app.use('/api', pedidosRouter);
app.use('/api', authRoutes);


app.post('/cambiarEstadoMesa', (req, res) => {
    const { idMesa } = req.body;
    try {
        const data = fs.readFileSync(mesasPath, 'utf-8');
        const mesas = JSON.parse(data);

        if (idMesa === 0) return res.json({ success: true, mesas });

        const mesa = mesas.find(m => m.id === parseInt(idMesa));
        if (!mesa) return res.status(444).json({ success: false, mensaje: "Mesa no encontrada." });

        if (mesa.ocupada) {
            mesa.ocupada = false;
            mesa.codigo = ""; 
        } else {
            mesa.codigo = Math.random().toString(36).substring(2, 7).toUpperCase();
            mesa.ocupada = true;
        }

        fs.writeFileSync(mesasPath, JSON.stringify(mesas, null, 2), 'utf-8');
        res.json({ success: true, mesas });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: "Error interno en el servidor." });
    }
});

app.listen(PORT, () => console.log(` Servidor en puerto ${PORT}`));