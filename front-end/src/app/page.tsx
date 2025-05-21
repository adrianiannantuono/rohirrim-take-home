'use client';

import { useState, useEffect } from "react";

let gridSize = 5;

enum Rotation {
  NORTH = "north",
  SOUTH = "south",
  WEST = "west",
  EAST = "east",
}

enum RotateDirection {
  LEFT = "left",
  RIGHT = "right",
}

export default function Home() {
  const [robotPosition, setRobotPosition] = useState({ x: -1, y: -1 });
  const [robotRotation, setRobotRotation] = useState<Rotation>(Rotation.NORTH);

  async function fetchRobotPosition() {
    try {
      const response = await fetch('/api/robotCurrentPosition'); // Updated URL
      if (response?.ok) {
        const data = await response.json();
        setRobotPosition({ x: data.x, y: data.y });
        setRobotRotation(data.direction as Rotation);
        console.log(`Output: ${data.x}, ${data.y}, ${data.direction}`);
      } else {
        console.log('Failed to fetch robot position');
      }
    } catch (error) {
      console.error('Error fetching robot position:', error);
    }
  }

  async function postRobotPosition(x: number, y: number, direction: Rotation) {
    try {
      const response = await fetch('/api/robotCurrentPosition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x,
          y,
          direction,
        }),
      });

      if (response?.ok) {
        //console.log('Robot position successfully posted to the server');
      } else {
        console.log('Failed to post robot position');
      }
    } catch (error) {
      console.error('Error posting robot position:', error);
    }
  }

  // Fetch robot position from the API
  useEffect(() => {
    fetchRobotPosition();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        rotateRobot(RotateDirection.LEFT);
      } else if (event.key === "ArrowRight") {
        rotateRobot(RotateDirection.RIGHT);
      } else if (event.key === "Enter") {
        moveRobot();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [robotRotation, robotPosition]);

  function placeRobot(x: number, y: number) {
    // Check if the position is within the grid bounds
    console.log(`PLACE ${x}, ${y}, NORTH`);
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      setRobotPosition({ x, y });
      setRobotRotation(Rotation.NORTH); // Default direction when placing the robot
      postRobotPosition(x, y, Rotation.NORTH); // Send the new position to the server
    } else {
      console.error("Invalid position for the robot");
    }
  }

  function rotateRobot(direction: RotateDirection) {
    // Rotate the robot to the left or right
    const directions = [Rotation.WEST, Rotation.NORTH, Rotation.EAST, Rotation.SOUTH];
    const currentIndex = directions.indexOf(robotRotation);
    var newRotation = robotRotation;
    if (direction === RotateDirection.LEFT) {
      console.log("LEFT");
      newRotation = directions[(currentIndex - 1 + directions.length) % directions.length];
      setRobotRotation(newRotation);
    } else if (direction === RotateDirection.RIGHT) {
      console.log("RIGHT");
      newRotation = directions[(currentIndex + 1) % directions.length];
      setRobotRotation(newRotation);
    }
    postRobotPosition(robotPosition.x, robotPosition.y, newRotation); // Send the new position to the server
  }

  function moveRobot() {
    const newPosition = { ...robotPosition };
    switch (robotRotation) {
      case Rotation.NORTH:
        if (newPosition.y < gridSize - 1) newPosition.y += 1;
        break;
      case Rotation.SOUTH:
        if (newPosition.y > 0) newPosition.y -= 1;
        break;
      case Rotation.WEST:
        if (newPosition.x > 0) newPosition.x -= 1;
        break;
      case Rotation.EAST:
        if (newPosition.x < gridSize - 1) newPosition.x += 1;
        break;
      default:
        console.error("Invalid direction");
    }

    console.log("MOVE");
    setRobotPosition(newPosition); // Update the state
    postRobotPosition(newPosition.x, newPosition.y, robotRotation); // Send the new position to the server
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center h-[100vh] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-neutral-900 text-white">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <div className="w-full flex flex-col gap-4 items-center bg-neutral-800 p-4 rounded-md">
          Click to place the robot, use the buttons or arrow keys to move
        </div>
        <div className="grid grid-cols-1 gap-4 w-full">
          <div className="flex flex-col gap-4 items-center">
            <div
              className="grid w-full h-full"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(70px, 1fr))`,
                gridTemplateRows: `repeat(${gridSize}, minmax(70px, 1fr))`,
                height: `min(100vh, ${gridSize * 70}px)`,
                width: `min(100vw, ${gridSize * 70}px)`,
              }}
            >
              {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                const x = index % gridSize; // Column index
                const y = gridSize - 1 - Math.floor(index / gridSize); // Row index (inverted for bottom-left origin)
                const isRobotHere = robotPosition.x === x && robotPosition.y === y;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-center border border-neutral-600 bg-neutral-800 hover:bg-neutral-700 hover:cursor-pointer"
                    onClick={() => {
                      placeRobot(x, y);
                    }}
                    role="grid-button"
                  >
                    {isRobotHere && (
                      <img
                        src={`/robot_${robotRotation}.png`}
                        alt={`Robot facing ${robotRotation}`}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <button
            className="bg-cyan-500 hover:bg-cyan-700 text-black py-1 px-5 rounded hover:cursor-pointer m-2 text-sm"
            onClick={() => {
              rotateRobot(RotateDirection.LEFT);
            }}
          >
            Left
          </button>
          <button
            className="bg-cyan-500 hover:bg-cyan-700 text-black py-1 px-5 rounded hover:cursor-pointer m-2 text-sm"
            onClick={() => {
              moveRobot();
            }}
            role="move-button"
          >
            Move
          </button>
          <button
            className="bg-cyan-500 hover:bg-cyan-700 text-black py-1 px-5 rounded hover:cursor-pointer m-2 text-sm"
            onClick={() => {
              rotateRobot(RotateDirection.RIGHT);
            }}
          >
            Right
          </button>
        </div>
        <div>
          <button
            className="bg-neutral-800 border-1 border-cyan-500 hover:bg-neutral-700 text-white py-1 px-10 rounded hover:cursor-pointer text-sm"
            onClick={() => {
              console.log("REPORT");
              fetchRobotPosition();
            }}
          >
            Report
          </button>
        </div>
      </main>
    </div>
  );
}
