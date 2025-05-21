import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Page from '../app/page';

describe('Page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<Page />);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('renders the grid', () => {
    render(<Page />);
    const gridCells = screen.getAllByRole('grid-button');
    expect(gridCells.length).toBe(25); // 5x5 grid
  });

  it('places the robot on a grid cell when clicked', () => {
    render(<Page />);
    const gridCells = screen.getAllByRole('grid-button');
    fireEvent.click(gridCells[0]); // Click the first cell
    const robotImage = screen.getByAltText(/Robot facing north/i);
    expect(robotImage).toBeInTheDocument();
  });

  it('rotates the robot to the left', () => {
    render(<Page />);
    const gridCells = screen.getAllByRole('grid-button');
    fireEvent.click(gridCells[0]); // Place the robot
    const leftButton = screen.getByText(/Left/i);
    fireEvent.click(leftButton);
    const robotImage = screen.getByAltText(/Robot facing west/i);
    expect(robotImage).toBeInTheDocument();
  });

  it('rotates the robot to the right', () => {
    render(<Page />);
    const gridCells = screen.getAllByRole('grid-button');
    fireEvent.click(gridCells[0]); // Place the robot
    const rightButton = screen.getByText(/Right/i);
    fireEvent.click(rightButton);
    const robotImage = screen.getByAltText(/Robot facing east/i);
    expect(robotImage).toBeInTheDocument();
  });

  it('moves the robot forward', () => {
    render(<Page />);
    const gridCells = screen.getAllByRole('grid-button');
    fireEvent.click(gridCells[0]); // Place the robot
    const moveButton = screen.getByRole('move-button');
    fireEvent.click(moveButton);
    const robotImage = screen.getByAltText(/Robot facing north/i);
    expect(robotImage).toBeInTheDocument();
  });

  it('fetches the robot position when "Report" is clicked', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ x: 0, y: 0, direction: 'north' }),
      })
    ) as jest.Mock;

    render(<Page />);
    const reportButton = screen.getByText(/Report/i);

    await act(async () => {
      fireEvent.click(reportButton);
    });

    await act(async () => {
      expect(global.fetch).toHaveBeenCalledWith('/api/robotCurrentPosition');
    });
  });
    

  it('does not move the robot if it is not placed on the grid', () => {
    render(<Page />);
    const moveButton = screen.getByRole('move-button');

    fireEvent.click(moveButton);

    const robotImage = screen.queryByAltText(/Robot facing north/i);
    expect(robotImage).not.toBeInTheDocument();
  });

  it('does not rotate the robot if it is not placed on the grid', () => {
    render(<Page />);
    const leftButton = screen.getByText(/Left/i);

    fireEvent.click(leftButton);

    const robotImage = screen.queryByAltText(/Robot facing west/i);
    expect(robotImage).not.toBeInTheDocument();
  });

  it('updates the robot position correctly after multiple moves', () => {
    render(<Page />);
    const gridCells = screen.getAllByRole('grid-button');
    fireEvent.click(gridCells[0]); // Place the robot

    const moveButton = screen.getByRole('move-button');
    fireEvent.click(moveButton); // Move forward
    fireEvent.click(moveButton); // Move forward again

    const robotImage = screen.getByAltText(/Robot facing north/i);
    expect(robotImage).toBeInTheDocument();
  });

  it('makes sure robot cannot go out of bounds', () => {
    render(<Page />);
    const gridCells = screen.getAllByRole('grid-button');
    fireEvent.click(gridCells[0]); // Place the robot

    const moveButton = screen.getByRole('move-button');
    for (let i = 0; i < 10; i++) {
      fireEvent.click(moveButton); // Attempt to move out of bounds
    }

    const robotImage = screen.getByAltText(/Robot facing north/i);
    expect(robotImage).toBeInTheDocument();
  });

  it('does not allow the robot to rotate if it is not placed', () => {
    render(<Page />);
    const rightButton = screen.getByText(/Right/i);

    fireEvent.click(rightButton);

    const robotImage = screen.queryByAltText(/Robot facing east/i);
    expect(robotImage).not.toBeInTheDocument();
  });

  it('handles multiple fetch calls correctly', async () => {
    global.fetch = jest.fn((url, options) => {
      if (url === '/api/robotPosition') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ x: 1, y: 1, direction: 'east' }),
        });
      }
    }) as jest.Mock;

    render(<Page />);
    const reportButton = screen.getByText(/Report/i);

    await act(async () => {
      fireEvent.click(reportButton);
      fireEvent.click(reportButton); // Multiple fetch calls
    });

    await act(async () => {
      expect(global.fetch).toHaveBeenCalledTimes(3); // 1 for initial fetch + 2 for report button clicks
    });
  });

  // More tests not implemented yet:
  // - Test for the robot's direction after multiple rotations
});