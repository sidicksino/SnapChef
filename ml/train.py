from ultralytics import YOLO

def main():
    print("🚀 Initializing SnapChef Edge Vision Training...")
    
    # 1. Load a pretrained YOLOv8 Nano model (perfect for mobile edge devices)
    model = YOLO('yolov8n.pt')

    # 2. Train the model
    # Note: Replace 'data.yaml' with the actual path to the data.yaml file you download from Roboflow
    print("🧠 Starting training...")
    results = model.train(
        data='data.yaml', 
        epochs=50,          # 50 epochs is a good start, increase if accuracy is low
        imgsz=320,          # 320x320 is highly optimized for real-time mobile inference
        batch=16,
        project='snapchef_vision',
        name='edge_model'
    )

    # 3. Export to TFLite (INT8 Quantized for maximum speed on mobile)
    print("📦 Exporting model to TFLite INT8 format...")
    model.export(
        format='tflite',
        int8=True,
        imgsz=320
    )

    print("✅ Complete! Your .tflite model is ready for React Native.")

if __name__ == '__main__':
    main()
