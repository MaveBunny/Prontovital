# ProntoVital — Frontend Web Application

> Aplicação web desenvolvida com **React 19**, **Vite** e **Tailwind CSS**, conectada à API RESTful na nuvem do ProntoVital.

Consulte a documentação completa no [README principal da raiz do repositório](../README.md).

---

## 🚀 Como Executar

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o `.env`:**
   ```bash
   cp .env.example .env
   ```
   Certifique-se de que a variável aponta para a API na nuvem:
   ```env
   VITE_API_URL=https://prontovital-api.onrender.com
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse: [http://localhost:5173](http://localhost:5173)

4. **Build para Produção:**
   ```bash
   npm run build
   ```

---

## 🔑 Credenciais para Testes Rápidos

* **Admin:** `admin@email.com` | Senha: `coxinha123`
* **Clínica:** `ciaesorriso@gmail.com` | Senha: `admin`
* **Médico:** `amandavirginia@gmail.com` | Senha: `admin`
* **Paciente:** `severino@email.com` | Senha: `senhaForte123`
