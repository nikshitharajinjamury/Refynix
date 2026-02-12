# Refynix Backend

## Setup and Run

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment (optional but recommended):**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment:**
    - Rename `.env.example` to `.env`.
    - Edit `.env` and add your `GROQ_API_KEY`.

5.  **Run the Server:**
    ```bash
    python -m uvicorn main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

## API Endpoints

-   `POST /analyze`: Analyzes code using Groq Llama 3.3.
-   `GET /health`: Health check.
