# SnapChef - Project Context

## Agent Instructions
* **CRITICAL:** Before taking any action or starting a new task, you MUST read the `implementation_plan.md` file in this directory to verify the system architecture, database design, and current progress.
* Update `implementation_plan.md` whenever a step or phase is completed, or if the architecture changes.

## Architecture Overview
*   **Mobile App:** React Native, Expo, `react-native-fast-tflite`.
*   **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL.
*   **Vision Model:** YOLOv8 (TFLite) running on-device.
*   **NLP:** OpenAI API (GPT-4o) running on the backend.

## Workflow
1. User takes a photo of their fridge using the mobile app.
2. The on-device YOLOv8 model detects ingredients and extracts a list of labels.
3. The user confirms/edits the list, then sends it to the FastAPI backend.
4. The backend constructs a prompt and calls the OpenAI API to generate a structured recipe.
5. The backend returns the recipe to the mobile app, which can then be saved to the database.
