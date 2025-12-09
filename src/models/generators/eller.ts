import { mapGenerator } from "src/utils";

interface EllerCell {
  rightWall: boolean;
  bottomWall: boolean;
  set: number | null;
}

type MazeRow = Omit<EllerCell, "set">[];

export type EllerGeneratorResult = {
  row: MazeRow;
  rowIndex: number;
  isComplete: boolean;
};

export class EllerMazeGenerator {
  private cols: number;
  private rows: number;
  private currentRow: EllerCell[];
  private nextRowSetId: number;
  private currentRowIndex: number;
  private horizontalBias: number;
  private verticalBias: number;

  constructor(
    rows: number,
    cols: number,
    horizontalBias: number = 0.5,
    verticalBias: number = 0.5,
  ) {
    if (cols <= 0 || rows <= 0) {
      throw new Error("cols and rows must be positive numbers");
    }
    if (
      horizontalBias < 0 ||
      horizontalBias > 1 ||
      verticalBias < 0 ||
      verticalBias > 1
    ) {
      throw new Error("Biases must be between 0 and 1");
    }

    this.cols = Math.floor(cols);
    this.rows = Math.floor(rows);
    this.horizontalBias = horizontalBias;
    this.verticalBias = verticalBias;
    this.currentRow = [];
    this.nextRowSetId = 0;
    this.currentRowIndex = 0;

    this.initializeFirstRow();
  }

  private initializeFirstRow(): void {
    for (let x = 0; x < this.cols; x++) {
      this.currentRow.push({
        rightWall: true,
        bottomWall: true,
        set: this.nextRowSetId++,
      });
    }
  }

  *generate(): Generator<EllerGeneratorResult, void, unknown> {
    for (let y = 0; y < this.rows - 1; y++) {
      this.processRow();

      yield {
        row: this.getRowWithoutSets(),
        rowIndex: y,
        isComplete: false,
      };

      this.prepareNextRow();
    }

    this.processLastRow();

    yield {
      row: this.getRowWithoutSets(),
      rowIndex: this.rows - 1,
      isComplete: true,
    };
  }

  private processRow(): void {
    this.createHorizontalConnections();

    this.createVerticalPassages();
  }

  private createHorizontalConnections(): void {
    for (let x = 0; x < this.cols - 1; x++) {
      if (this.currentRow[x].set === this.currentRow[x + 1].set) {
        continue;
      }

      if (Math.random() < this.horizontalBias) {
        this.currentRow[x].rightWall = false;

        this.mergeSets(x, x + 1);
      }
    }
  }

  private createVerticalPassages(): void {
    const sets = new Map<number, number[]>();

    for (let x = 0; x < this.cols; x++) {
      const set = this.currentRow[x].set!;
      if (!sets.has(set)) {
        sets.set(set, []);
      }
      sets.get(set)!.push(x);
    }

    for (const [_set, columns] of sets) {
      const randomColumn = columns[Math.floor(Math.random() * columns.length)];
      this.currentRow[randomColumn].bottomWall = false;

      for (const x of columns) {
        if (x !== randomColumn && Math.random() < this.verticalBias) {
          this.currentRow[x].bottomWall = false;
        }
      }
    }
  }

  private prepareNextRow(): void {
    const nextRow: EllerCell[] = [];

    for (let x = 0; x < this.cols; x++) {
      if (this.currentRow[x].bottomWall) {
        nextRow.push({
          rightWall: true,
          bottomWall: true,
          set: this.nextRowSetId++,
        });
      } else {
        nextRow.push({
          rightWall: true,
          bottomWall: true,
          set: this.currentRow[x].set,
        });
      }
    }

    this.currentRow = nextRow;
    this.currentRowIndex++;
  }

  private processLastRow(): void {
    for (let x = 0; x < this.cols - 1; x++) {
      if (this.currentRow[x].set !== this.currentRow[x + 1].set) {
        this.currentRow[x].rightWall = false;
        this.mergeSets(x, x + 1);
      }
    }

    for (let x = 0; x < this.cols; x++) {
      this.currentRow[x].bottomWall = true;
    }
  }

  private mergeSets(index1: number, index2: number): void {
    const setToReplace = this.currentRow[index2].set;
    const newSet = this.currentRow[index1].set;

    for (let x = 0; x < this.cols; x++) {
      if (this.currentRow[x].set === setToReplace) {
        this.currentRow[x].set = newSet;
      }
    }
  }

  private getRowWithoutSets(): MazeRow {
    return this.currentRow.map((cell) => ({
      rightWall: cell.rightWall,
      bottomWall: cell.bottomWall,
    }));
  }

  getProgress(): number {
    return this.currentRowIndex / this.rows;
  }
}

export function eller(m: number, n: number) {
  const generator = new EllerMazeGenerator(m, n);
  const cellId = (row: number, col: number) => `${row},${col}`;

  return mapGenerator(generator.generate(), (value) => {
    const newRow = [];

    const currRow = value.row;

    for (let j = 0; j < currRow.length - 1; j++) {
      if (!currRow[j].rightWall)
        newRow.push([cellId(value.rowIndex, j), cellId(value.rowIndex, j + 1)]);
    }

    for (let j = 0; j < currRow.length; j++) {
      if (!currRow[j].bottomWall && value.rowIndex < m - 1)
        newRow.push([cellId(value.rowIndex, j), cellId(value.rowIndex + 1, j)]);
    }

    return newRow;
  });
}
