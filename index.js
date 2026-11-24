
const express = require("express")
const app = express()
app.use(express.json())
const port = 3000

const db = require("./db")



app.get("/aula", async (req, res) => {
    try {
        
        const resultado = await db.pool.query("SELECT * FROM aula")
        res.status(200).json(resultado[0])
    } catch (erro) {
        res.status(500).json({erro: erro.message})
    }
})


app.post("/aula", async (req, res) => {
    try {
        const dados = req.body
        const resultado = await db.pool.query(
            "INSERT INTO aula (serie, turma, componente, professor) VALUES (?, ?, ?, ?)",
            [dados.serie, dados.turma, dados.componente, dados.professor]
        )
        res.status(201).json(
            {resultado: "Aula cadastrada, ID = " + resultado[0].insertId}
        )
    } catch (erro) {
        res.status(500).json({erro: erro.message})
    }
})



app.delete("/aula/:id", async (req, res) => {
    try {
        const id = req.params.id
        const resultado = await db.pool.query(
            "DELETE FROM aula WHERE id = ?",
            [id]
        )
      
        if (resultado[0].affectedRows === 0) {
            return res.status(404).json({erro: "Aula não encontrada, ID = " + id})
        }
        res.status(200).json({resultado: "Aula excluída, ID = " + id})
    } catch (erro) {
      
        if (erro.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                erro: "Não é possível excluir a aula, pois ela possui horários cadastrados. Exclua os horários primeiro."
            })
        }
        res.status(500).json({erro: erro.message})
    }
})



app.post("/horario", async (req, res) => {
    try {
        const dados = req.body
        const resultado = await db.pool.query(
            "INSERT INTO horario_aula (idaula, dia_semana, ordem) VALUES (?, ?, ?)",
            [dados.idaula, dados.dia_semana, dados.ordem]
        )
        res.status(201).json(
            {resultado: "Horário cadastrado, ID = " + resultado[0].insertId}
        )
    } catch (erro) {
        
        if (erro.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                erro: "A aula com ID " + req.body.idaula + " não existe. Cadastre a aula antes de adicionar o horário."
            })
        }
        res.status(500).json({erro: erro.message})
    }
})



app.get("/horario/:dia", async (req, res) => {
    try {
        const dia = req.params.dia
        const resultado = await db.pool.query(
            `SELECT h.id, h.idaula, h.dia_semana, h.ordem,
                    a.serie, a.turma, a.componente, a.professor
             FROM horario_aula h
             INNER JOIN aula a ON a.id = h.idaula
             WHERE h.dia_semana = ?
             ORDER BY h.ordem`,
            [dia]
        )
        res.status(200).json(resultado[0])
    } catch (erro) {
        res.status(500).json({erro: erro.message})
    }
})



app.delete("/horario/:id", async (req, res) => {
    try {
        const id = req.params.id
        const resultado = await db.pool.query(
            "DELETE FROM horario_aula WHERE id = ?",
            [id]
        )
        if (resultado[0].affectedRows === 0) {
            return res.status(404).json({erro: "Horário não encontrado, ID = " + id})
        }
        res.status(200).json({resultado: "Horário excluído, ID = " + id})
    } catch (erro) {
        res.status(500).json({erro: erro.message})
    }
})


app.listen(port, ()=>{
    console.log("API rodando na porta " + port)
})

// No Rapid Client:
// GET    http://127.0.0.1:3000/aula
// POST   http://127.0.0.1:3000/aula
// DELETE http://127.0.0.1:3000/aula/1
// POST   http://127.0.0.1:3000/horario
// GET    http://127.0.0.1:3000/horario/Segunda
// DELETE http://127.0.0.1:3000/horario/1
