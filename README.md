# Traveling Salesman Problem - Store

Web application for solving a simplified traveling salesman problem in a store with shelves.

## Description

The store is represented as a 4x4 grid:

- **Entrance (I)**: (0,0) - green cell
- **Exit (O)**: (3,0) - red cell
- **Products (P)**: orange cells

## Movement Rules

- You can always move **vertically** (along the Y axis)
- You can move **horizontally** (along the X axis) only on lines y=0 or y=3

## Usage

1. Open `index.html` in your browser
2. Enter product coordinates in the format: `(x,y),(x,y),...`
   - Example: `(0,1),(1,2),(2,3)`
3. Click the "Find optimal path" button
4. The application will find the optimal route and visualize it

## Visualization

- **Green cell (I)**: Entrance
- **Red cell (O)**: Exit
- **Orange cells (P)**: Products
- **Blue cells**: Path
- **Purple cell**: Current position (animation)

## Algorithm

The application uses a brute force algorithm that checks all permutations of products to find the optimal path with the minimum number of moves.
