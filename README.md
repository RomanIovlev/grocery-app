# Traveling Salesman Problem - Store

A React web application for solving a simplified traveling salesman problem in a store with shelves.

## Description

The store is represented as a 4x4 grid:

- **Entrance (🛒)**: (0,0) - blue cell
- **Exit (💰)**: (3,0) - blue cell
- **Products**: orange cells with fruit/vegetable icons

## Movement Rules

- You can always move **vertically** (along the Y axis)
- You can move **horizontally** (along the X axis) only on lines y=0 or y=3

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

### Running the Application

1. Start the development server:

```bash
npm run dev
```

2. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Select Products**: Click on grid locations to add products. Click again to remove them.
2. **Find Path**: Click the "Find Products" button to calculate the optimal route.
3. **View Route**: The navigation screen shows the optimal path with animated visualization and step-by-step instructions.
4. **Language**: Switch between English (EN) and Dutch (NL) using the language switcher in the top-right corner.

## Features

- Interactive grid for product selection
- Optimal path calculation using brute force algorithm
- Animated path visualization with arrows
- Step-by-step navigation instructions
- Multi-language support (English/Dutch)
- Responsive design

## Visualization

- **Blue cells (🛒/💰)**: Entrance and Exit
- **Orange cells**: Products with fruit/vegetable icons
- **Blue arrows**: Optimal path
- **Gray lines**: Allowed movement paths

## Algorithm

The application uses a brute force algorithm that checks all permutations of products to find the optimal path with the minimum number of moves, respecting the movement constraints (vertical movement always allowed, horizontal only on y=0 and y=3).

## Technology Stack

- React 18
- Vite (build tool)
- Vanilla CSS (preserved from original design)
