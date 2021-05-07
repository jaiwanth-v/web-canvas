import React, { useEffect, useRef } from "react";
import "./App.css";

import { fabric } from "fabric";

import paintbrush from "./Icons/paintbrush.png";
import eraser from "./Icons/eraser.png";
import dustbin from "./Icons/dustbin.png";
import square from "./Icons/square.png";
import triangle from "./Icons/triangle.png";
import circle from "./Icons/circle.png";
import selecthand from "./Icons/selecthand.png";
import text from "./Icons/text.png";
import "./EraserBrush";

let canvas;
let undo = [],
  redo = [];
let historyOperations = false;
let previousBrushColor;
function App() {
  const strokeColor = useRef(null);
  const setBrushColor = (color) => {
    canvas.freeDrawingBrush.color = color;
  };
  const setBrushSize = (size) => {
    canvas.freeDrawingBrush.width = parseInt(size);
  };
  const setStrokeColor = (color) => {
    strokeColor.current = color;
  };
  const onObjectModified = (e) => {
    if (historyOperations === true) return;
    undo.push(e.target.canvas.toJSON());
  };
  const onUndo = () => {
    if (!undo.length) return;
    const prevState = undo.pop();
    historyOperations = true;
    canvas.clear().renderAll();
    canvas.loadFromJSON(undo[undo.length - 1]);
    canvas.renderAll();
    redo.push(prevState);
    historyOperations = false;
  };

  const onRedo = () => {
    if (!redo.length) return;
    historyOperations = true;
    const prevState = redo.pop();
    canvas.clear().renderAll();
    canvas.loadFromJSON(prevState);
    canvas.renderAll();
    undo.push(prevState);
    historyOperations = false;
  };

  useEffect(() => {
    canvas = new fabric.Canvas("canvas");
    canvas.loadFromJSON({});
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.color = "#5DADE2";
    canvas.setHeight(window.innerHeight - 100);
    canvas.setWidth(window.innerWidth - 50);
    canvas.freeDrawingBrush.width = 5;
    canvas.on("object:added", onObjectModified);
    canvas.on("object:modified", onObjectModified);
    return () => canvas.dispose();
  }, []);

  //function to change brush size
  const handleBrushSizeChange = (e) => {
    setBrushSize(parseInt(e.target.value));
  };

  //function to generate different shapes
  const generateShape = (e) => {
    let elementClassName = e.target.classList;
    canvas.isDrawingMode = false;
    const strokeWidth = 2;

    if (elementClassName === "squareShape") {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: "transparent",
        width: 60,
        height: 60,
        angle: 90,
        stroke: strokeColor.current,
        strokeWidth,
      });
      canvas.add(rect);
    } else if (elementClassName === "triangleShape") {
      const rect = new fabric.Triangle({
        left: 200,
        top: 150,
        fill: "transparent",
        width: 60,
        height: 60,
        stroke: strokeColor.current,
        strokeWidth,
      });
      canvas.add(rect);
    } else if (elementClassName === "circleShape") {
      const rect = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        stroke: strokeColor.current,
        strokeWidth,
        fill: "transparent",
      });
      canvas.add(rect);
    } else {
      return;
    }
  };

  const deleteObjects = () => {
    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length === 0) {
      canvas.clear();
      return;
    } else if (activeObjects.length) {
      activeObjects.forEach((object) => {
        canvas.remove(object);
      });
    }
  };

  const addTextInput = () => {
    const textInput = new fabric.Textbox("Enter Text", {
      left: 100,
      top: 100,
      fontFamily: "ubuntu",
      width: 30,
      height: 40,
    });
    canvas.add(textInput);
    canvas.isDrawingMode = false;
  };

  const clearSaved = () => {
    canvas.clear();
  };
  return (
    <div className="App">
      <div className="toolSection">
        <div className="toolField">
          <div className="brushWidth">
            <div className="icon">
              <img
                src={paintbrush}
                alt="paintbrush-icon"
                className="paintBrushIcon"
                onClick={() => {
                  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                  canvas.freeDrawingBrush.color = previousBrushColor;
                  canvas.isDrawingMode = true;
                }}
              />
            </div>
            <input
              type="range"
              min="1"
              max="50"
              defaultValue="10"
              step="5"
              className="slider"
              onChange={handleBrushSizeChange}
            ></input>
          </div>

          <div className="colorsets">
            <div
              className="blue"
              style={{ background: "#5DADE2" }}
              onClick={() => {
                setBrushColor("#5DADE2");
                setStrokeColor("#5DADE2");
              }}
            ></div>
            <div
              className="red "
              style={{ background: "#E74C3C" }}
              onClick={() => {
                setBrushColor("#E74C3C");
                setStrokeColor("#E74C3C");
              }}
            ></div>
            <div
              className="yellow "
              style={{ background: "#F1C40F" }}
              onClick={() => {
                setBrushColor("#F1C40F");
                setStrokeColor("#F1C40F");
              }}
            ></div>
            <div
              className="green "
              style={{ background: "#239B56" }}
              onClick={() => {
                setBrushColor("#239B56");
                setStrokeColor("#239B56");
              }}
            ></div>
            <div
              className="black "
              style={{ background: "#17202A" }}
              onClick={() => {
                setBrushColor("#17202A");
                setStrokeColor("#239B56");
              }}
            ></div>
          </div>

          <div className="eraser">
            <div className="icon eraserDesc">
              <img
                src={eraser}
                alt="eraser-icon"
                className="eraserIcon"
                onClick={(e) => {
                  canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
                  previousBrushColor = canvas.freeDrawingBrush.color;
                }}
              />
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="10"
              defaultValue="10"
              className="slider"
              onChange={(e) => setBrushSize(e.target.value)}
            ></input>
          </div>

          <div className="deleteField">
            <div className="icon" onClick={deleteObjects}>
              <img src={dustbin} alt="delete-icon" className="deleteBtn" />
            </div>
          </div>
          <button onClick={onUndo}>Undo</button>
          <button onClick={onRedo}>Redo</button>
          <div className="selectionHand">
            <div
              className="icon"
              onClick={() => (canvas.isDrawingMode = false)}
            >
              <img
                src={selecthand}
                alt="select-icon"
                className="selecthandBtn"
              />
            </div>
          </div>

          <div className="textInput">
            <div className="icon">
              <img
                src={text}
                alt="textInput-icon"
                className="textInputBtn"
                onClick={addTextInput}
              />
            </div>
          </div>
          <div className="clearSaved icon" onClick={clearSaved}>
            Clear Saved
          </div>

          <div className="shapesMenuField">
            <div className="icon square">
              <img
                src={square}
                alt="square-icon"
                className="squareShape"
                onClick={(e) => generateShape(e)}
              />
            </div>
            <div className="icon">
              <img
                src={triangle}
                alt="triangle-icon"
                className="triangleShape"
                onClick={(e) => generateShape(e)}
              />
            </div>
            <div className="icon">
              <img
                src={circle}
                alt="circle-icon"
                className="circleShape"
                onClick={(e) => generateShape(e)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="canvasField">
        <canvas id="canvas" />
      </div>
    </div>
  );
}

export default App;
