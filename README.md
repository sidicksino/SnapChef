# SnapChef 🧑‍🍳📸

SnapChef is an intelligent mobile application that allows users to snap a photo of the ingredients in their fridge and instantly generates a delicious recipe using an AI vision model (YOLOv8 Edge) and a Large Language Model (OpenAI GPT-4o).

## Project Structure

```text
fridge-recipe-generator/
│
├── backend/                  # FastAPI Backend API
│   ├── main.py               # Application entry point
│   ├── database.py           # SQLAlchemy setup and connection
│   ├── models.py             # Database ORM models (User, Recipe, etc.)
│   ├── schemas.py            # Pydantic validation schemas
│   ├── security.py           # Password hashing & JWT token logic
│   ├── deps.py               # Dependency injection (e.g., get_current_user)
│   ├── requirements.txt      # Python dependencies
│   └── routers/              # API Endpoints
│       ├── auth.py           # Login, Register, Password Management
│       ├── users.py          # Profile management
│       └── recipes.py        # LLM Generation & History
│
├── ml/                       # Machine Learning / Computer Vision
│   ├── train_colab.ipynb     # Google Colab notebook for training YOLOv8n
│   └── train.py              # Local training script (alternative to Colab)
│
├── mobile/                   # Expo (React Native) mobile app
│   ├── src/app/               # expo-router file-based routes
│   ├── src/components/        # Shared UI components
│   ├── src/global.css         # Tailwind directives (Nativewind)
│   ├── tailwind.config.js     # Nativewind/Tailwind config
│   └── app.json                # Expo app config
│
├── .gitignore                # Git ignore rules
├── AGENT.md                  # Project context and rules for AI Agent
├── implementation_plan.md    # Master architecture and API design document
└── task.md                   # Checklist of completed and pending tasks
```

## How to Run the Backend

Follow these steps to run the backend API server on your local machine.

### 1. Prerequisites
- Python 3.10+ installed on your Mac (`python3`).

### 2. Setup the Virtual Environment
Open your terminal, navigate to the `backend` folder, and create a virtual environment to isolate the dependencies:

```bash
cd backend
python3 -m venv venv
```

### 3. Activate the Environment
Activate the virtual environment. **You must do this every time you open a new terminal.**

```bash
source venv/bin/activate
```
*(Your terminal prompt should now have `(venv)` at the beginning).*

### 4. Install Dependencies
Install all required Python packages:

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables
Create a file named `.env` inside the `backend` folder and add your OpenAI API Key:

```env
OPENAI_API_KEY="your-api-key-here"
```

### 6. Run the Server
Start the FastAPI development server:

```bash
fastapi dev main.py
```

### 7. View the API Documentation
Once the server is running, you can view the interactive API documentation and test the endpoints directly in your browser:
- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
