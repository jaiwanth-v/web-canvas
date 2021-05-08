/* eslint-disable no-undef */
import React, { useEffect, useRef } from "react";
import "./App.css";
import { fabric } from "fabric";
import "./EraserBrush";
import Draggable from "react-draggable";
let canvas,
  activeClass = null;
let undo = [],
  redo = [];
let historyOperations = false;
let previousBrushColor = "#5DADE2",
  previousBrushSize = 7,
  noPointer = false;
function App() {
  useEffect(() => {
    function deleteKey(e) {
      if (e.keyCode === 46) deleteObjects();
    }
    document.addEventListener("mousemove", (e) => {
      if (noPointer) {
        const toolSection = document.getElementById("toolSection");
        const isOutside = !toolSection.matches(":hover");
        if (isOutside) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: "disable-pointer-events",
              data: toolSection.getBoundingClientRect(),
            });
          });
        }
      }
    });
    canvas = new fabric.Canvas("canvas");
    canvas.loadFromJSON({});
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.color = previousBrushColor;
    canvas.setHeight(window.outerHeight);
    canvas.setWidth(window.outerWidth);
    canvas.freeDrawingBrush.width = previousBrushSize;
    changeCursor("pencil");
    setActive("pencil");
    canvas.on("object:added", onObjectModified);
    canvas.on("object:modified", onObjectModified);
    window.addEventListener("keydown", deleteKey);
    return () => {
      canvas.dispose();
      window.removeEventListener("keydown", deleteKey);
    };
  }, []);

  function changeCursor(cursor) {
    document.getElementById("canvas").className = `cursor-${cursor}`;
    document.querySelector(
      "canvas.upper-canvas"
    ).className = `upper-canvas cursor-${cursor}`;
  }

  function setActive(targetClass) {
    if (activeClass) {
      document
        .getElementsByClassName(activeClass)[0]
        .classList.toggle("active");
    }
    if (targetClass !== "mouse" && noPointer) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "enable-pointer-events",
        });
      });
      noPointer = false;
    }
    activeClass = targetClass;
    document.getElementsByClassName(targetClass)[0].classList.add("active");
  }
  function drawLine() {
    let line, isDown;
    setActive("line");
    changeCursor("draw");
    canvas.isDrawingMode = false;
    canvas.selection = false;
    removeEvents();
    canvas.on("mouse:down", function (o) {
      isDown = true;
      let pointer = canvas.getPointer(o.e);
      let points = [pointer.x, pointer.y, pointer.x, pointer.y];
      line = new fabric.Line(points, {
        strokeWidth: previousBrushSize,
        fill: previousBrushColor,
        stroke: previousBrushColor,
        strokeLineCap: "round",
        originX: "center",
        originY: "center",
      });
      canvas.add(line);
    });
    canvas.on("mouse:move", function (o) {
      if (!isDown) return;
      let pointer = canvas.getPointer(o.e);
      line.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      canvas.renderAll();
    });
    canvas.on("mouse:up", function (o) {
      if (isDown) {
        isDown = false;
        canvas.selection = true;
        canvas.setActiveObject(line).renderAll();
        removeEvents();
        changeCursor("select");
        setActive("select");
      }
    });
  }

  function drawCircle() {
    setActive("circle");
    changeCursor("draw");
    canvas.isDrawingMode = false;
    canvas.selection = false;
    let ellipse, isDown, origX, origY;
    removeEvents();
    canvas.on("mouse:down", function (o) {
      isDown = true;
      let pointer = canvas.getPointer(o.e);
      origX = pointer.x;
      origY = pointer.y;
      ellipse = new fabric.Ellipse({
        left: origX,
        top: origY,
        originX: "left",
        originY: "top",
        rx: pointer.x - origX,
        ry: pointer.y - origY,
        angle: 0,
        fill: "transparent",
        stroke: previousBrushColor,
        strokeWidth: previousBrushSize,
        type: "ellipse",
      });
      canvas.add(ellipse);
    });

    canvas.on("mouse:move", function (o) {
      if (!isDown) return;
      let pointer = canvas.getPointer(o.e);
      if (ellipse === null) {
        return;
      }
      let rx = Math.abs(origX - pointer.x) / 2;
      let ry = Math.abs(origY - pointer.y) / 2;
      if (rx > ellipse.strokeWidth) rx -= ellipse.strokeWidth / 2;

      if (ry > ellipse.strokeWidth) ry -= ellipse.strokeWidth / 2;

      ellipse.set({ rx: rx, ry: ry });

      if (origX > pointer.x) ellipse.set({ originX: "right" });
      else ellipse.set({ originX: "left" });

      if (origY > pointer.y) ellipse.set({ originY: "bottom" });
      else ellipse.set({ originY: "top" });

      canvas.renderAll();
    });

    canvas.on("mouse:up", function (o) {
      if (isDown) {
        isDown = false;
        canvas.selection = true;
        canvas.setActiveObject(ellipse).renderAll();
        removeEvents();
        changeCursor("select");
        setActive("select");
      }
    });
  }

  function drawRectangle() {
    changeCursor("draw");
    setActive("rectangle");
    canvas.isDrawingMode = false;
    let rect, isDown, origX, origY;
    canvas.selection = false;
    removeEvents();
    canvas.on("mouse:down", function (o) {
      isDown = true;
      let pointer = canvas.getPointer(o.e);
      origX = pointer.x;
      origY = pointer.y;
      rect = new fabric.Rect({
        left: origX,
        top: origY,
        originX: "left",
        originY: "top",
        width: pointer.x - origX,
        height: pointer.y - origY,
        angle: 0,
        fill: "transparent",
        stroke: previousBrushColor,
        strokeWidth: previousBrushSize,
        transparentCorners: false,
      });
      canvas.add(rect);
    });

    canvas.on("mouse:move", function (o) {
      if (!isDown) return;
      let pointer = canvas.getPointer(o.e);

      if (origX > pointer.x) {
        rect.set({
          left: Math.abs(pointer.x),
        });
      }
      if (origY > pointer.y) {
        rect.set({
          top: Math.abs(pointer.y),
        });
      }

      rect.set({
        width: Math.abs(origX - pointer.x),
      });
      rect.set({
        height: Math.abs(origY - pointer.y),
      });

      canvas.renderAll();
    });

    canvas.on("mouse:up", function (o) {
      if (isDown) {
        canvas.selection = true;
        isDown = false;
        canvas.setActiveObject(rect).renderAll();
        removeEvents();
        changeCursor("select");
        setActive("select");
      }
    });
  }

  function removeEvents() {
    canvas.off("mouse:down");
    canvas.off("mouse:up");
    canvas.off("mouse:move");
  }
  const strokeColor = useRef(null);
  const setBrushColor = (color) => {
    previousBrushColor = color;
    canvas.freeDrawingBrush.color = color;
  };
  const setBrushSize = (size) => {
    previousBrushSize = size;
    canvas.freeDrawingBrush.width = parseInt(size);
  };
  const setStrokeColor = (color) => {
    previousBrushColor = color;
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

  const handleBrushSizeChange = (e) => {
    e.preventDefault();
    setBrushSize(parseInt(e.target.value));
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
    setActive("select");
    changeCursor("select");
    const textInput = new fabric.Textbox("Enter Text", {
      left: window.innerWidth / 2,
      top: window.innerHeight / 4,
      fontFamily: "ubuntu",
      stroke: previousBrushColor,
      fill: previousBrushColor,
      width: 60,
      height: 60,
    });
    canvas.add(textInput);
    canvas.isDrawingMode = false;
  };

  const clearSaved = () => {
    canvas.clear();
  };

  const changePointer = () => {
    setActive("mouse");
    changeCursor("mouse");
    noPointer = true;
  };

  const colors = [
    "#5DADE2",
    "#f44336",
    "#F1C40F",
    "#239B56",
    "#17202A",
    "#6200EE",
    "#03dac5",
    "grey",
    "#e91e63",
    "#3f51b5",
  ];

  return (
    <div className="App">
      <Draggable>
        <div className="toolSection" id="toolSection">
          <div className="toolField">
            <i
              className="fas fa-pencil-alt fa-2x pencil"
              title="Pencil"
              onClick={() => {
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                // canvas.freeDrawingBrush.decimate = 0;
                canvas.freeDrawingBrush.color = previousBrushColor;
                canvas.freeDrawingBrush.width = previousBrushSize;
                canvas.isDrawingMode = true;
                changeCursor("pencil");
                setActive("pencil");
              }}
            ></i>

            <i
              title="Eraser"
              className="fas fa-eraser fa-2x eraser"
              onClick={(e) => {
                canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
                canvas.freeDrawingBrush.width = 2 * previousBrushSize;
                changeCursor("eraser");
                setActive("eraser");
              }}
            />
            <i
              title="Add Text"
              className="fas fa-font fa-2x"
              onClick={addTextInput}
            />
            <i title="Undo" className="fas fa-undo fa-2x" onClick={onUndo} />
            <i title="Redo" className="fas fa-redo fa-2x" onClick={onRedo} />
            <i
              title="Rectangle"
              className="far fa-square fa-2x rectangle"
              onClick={drawRectangle}
            />
            <i
              title="Circle"
              className="far fa-circle fa-2x circle"
              onClick={drawCircle}
            />
            <i
              title="Line"
              className="fas fa-slash fa-2x line"
              onClick={drawLine}
            />
            <i
              title="Select Items"
              className="fas fa-object-ungroup fa-2x select"
              onClick={() => {
                canvas.isDrawingMode = false;
                changeCursor("select");
                setActive("select");
              }}
            />
            <i
              title="Interact with webpage"
              className="fas fa-mouse-pointer fa-2x mouse"
              onClick={changePointer}
            />
            <i
              title="Delete Selected Objects"
              onClick={deleteObjects}
              className="fas fa-trash fa-2x"
            />
            <i
              title="Clear Canvas"
              className="fas fa-broom  fa-2x"
              onClick={clearSaved}
            />
          </div>
          <div className="colorsets">
            {colors.map((color, key) => (
              <div
                key={key}
                style={{ background: color }}
                onClick={() => {
                  setBrushColor(color);
                  setStrokeColor(color);
                }}
              ></div>
            ))}
          </div>
          <input
            title="Brush Size"
            type="range"
            min="1"
            max="50"
            defaultValue={previousBrushSize.toString()}
            step="5"
            className="slider"
            onChange={handleBrushSizeChange}
          ></input>
          <i
            title="Exit Canvas"
            onClick={() =>
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs.sendMessage(tabs[0].id, {
                    type: "toggleExtension",
                  });
                }
              )
            }
            className="fas fa-sign-out-alt fa-2x exit"
          />
        </div>
      </Draggable>
      <div className="canvasField">
        <canvas id="canvas" />
      </div>
    </div>
  );
}

export default App;
