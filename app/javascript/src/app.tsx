import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

interface Props {}

interface StartScreenProps {
  game: Game;
  start: Function;
}

interface ScoreScreenProps {
  game: Game;
  start: Function;
}

interface TaskScreenProps {
  game: Game;
  correct: Function;
  incorrect: Function;
}

interface TaskChoice {
  value: number;
  text: string;
}

interface RoundTask {
  text: string;
  value: number;
  order: number;
  result: number;
  choices: TaskChoice[];
}

const tasks: RoundTask[] = [];

[...Array(7)].forEach(() => {
  const orderNumber = Math.floor(Math.random() * 3) + 2;
  const order = Math.pow(10, orderNumber);
  const roundNumber = order * (Math.floor(Math.random() * 90) + 10);
  const value = roundNumber + (Math.floor(Math.random() * order) - order / 2);

  const makeChoice = (v: number) => {
    const text = `約${v}`;
    const choice: TaskChoice = { value: v, text: text };
    return choice;
  };

  const choice = makeChoice(roundNumber);
  const fakeChoices: TaskChoice[] = [];

  fakeChoices.push(makeChoice(Math.ceil(value / order) * order));
  fakeChoices.push(makeChoice(Math.floor(value / order) * order));

  let direction: number;
  if (Math.random() > 0.5) {
    direction = 1;
  } else {
    direction = -1;
  }
  const fakeOrderNumber = orderNumber + direction;
  const fakeOrder = Math.pow(10, fakeOrderNumber);
  fakeChoices.push(makeChoice(Math.ceil(value / fakeOrder) * fakeOrder));
  fakeChoices.push(makeChoice(Math.floor(value / fakeOrder) * fakeOrder));

  const choices = fakeChoices
    .filter(c => {
      return c.value !== roundNumber;
    })
    .sort(function() {
      return Math.random() - 0.5;
    })
    .slice(0, 2);
  choices.push(choice);

  const task: RoundTask = {
    text: `次の数の${order}の位までのがい数はどれ？`,
    value: value,
    order: order,
    result: roundNumber,
    choices: choices.sort(function() {
      return Math.random() - 0.5;
    })
  };
  tasks.push(task);
});

[...Array(3)].forEach(() => {
  const orderNumber = Math.floor(Math.random() * 3) + 1;
  const order = Math.pow(10, orderNumber);
  const roundNumber = order * (Math.floor(Math.random() * 90) + 10);
  const minValue = roundNumber - order / 2;
  const maxValue = roundNumber + order / 2 - 1;

  if (Math.random() > 0.5 || false) {
    const fakeValue = maxValue + 1;
    tasks.push({
      text: `次の数は${order}の位までのがい数です。このがい数になる一番大きな数は？`,
      value: roundNumber,
      order: order,
      result: maxValue,
      choices: [
        { value: fakeValue, text: `${fakeValue}` },
        { value: minValue, text: `${minValue}` },
        { value: maxValue, text: `${maxValue}` },
        { value: roundNumber, text: `${roundNumber}` }
      ].sort(function() {
        return Math.random() - 0.5;
      })
    });
  } else {
    const fakeValue = minValue - 1;
    tasks.push({
      text: `次の数は${order}の位までのがい数です。このがい数になる一番小さな数は？`,
      value: roundNumber,
      order: order,
      result: minValue,
      choices: [
        { value: fakeValue, text: `${fakeValue}` },
        { value: minValue, text: `${minValue}` },
        { value: maxValue, text: `${maxValue}` },
        { value: roundNumber, text: `${roundNumber}` }
      ].sort(function() {
        return Math.random() - 0.5;
      })
    });
  }
});

interface Game {
  index: number;
  correctCount: number;
  startedAt: Date | null;
  endedAt: Date | null;
}

const initialGame: Game = {
  index: 0,
  correctCount: 0,
  startedAt: null,
  endedAt: null
};

function useGame() {
  const [game, setGame] = useState<Game>(initialGame);

  const start = () => {
    const newGame: Game = { ...game };
    newGame.startedAt = new Date();
    newGame.endedAt = null;
    newGame.index = 0;
    newGame.correctCount = 0;
    setGame(newGame);
  };

  const correct = () => {
    const newGame: Game = { ...game };
    newGame.index = game.index + 1;
    newGame.correctCount = game.correctCount + 1;
    if (newGame.index >= tasks.length) {
      newGame.endedAt = new Date();
    }
    setGame(newGame);
  };

  const incorrect = () => {
    const newGame: Game = { ...game };
    newGame.index = game.index + 1;
    if (newGame.index >= tasks.length) {
      newGame.endedAt = new Date();
    }
    setGame(newGame);
  };

  return { game, correct, incorrect, start };
}

const StartScreen: React.SFC<StartScreenProps> = props => {
  const { game, start } = props;

  return (
    <div>
      <h1>がい数トライアル</h1>
      <p>10問のがい数問題をどれだけ早く解けるかな？</p>
      <button onClick={() => start()}>スタート</button>
    </div>
  );
};

const ScoreScreen: React.SFC<ScoreScreenProps> = props => {
  const { game, start } = props;

  if (!game.startedAt || !game.endedAt) {
    return null;
  }

  const seconds = (game.endedAt.getTime() - game.startedAt.getTime()) / 1000;
  const score = Math.floor(Math.pow(game.correctCount, 5) / seconds);

  return (
    <div>
      <p>結果発表</p>
      <p>
        正解：{game.index}問中 {game.correctCount}問
      </p>
      <p>かかった時間：{seconds}秒</p>
      <p className="score">
        <b>{score}</b> 点
      </p>
      <div>
        <button onClick={() => start()}>もう一度</button>
      </div>
    </div>
  );
};

const TaskScreen: React.SFC<TaskScreenProps> = props => {
  const { game, correct, incorrect } = props;

  const getTimeSeconds = () => {
    if (!game.startedAt) {
      return 0;
    }

    return Math.floor((new Date().getTime() - game.startedAt.getTime()) / 1000);
  };

  const [timeSeconds, setTimeSeconds] = useState(getTimeSeconds());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeSeconds(getTimeSeconds());
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const task: RoundTask = tasks[game.index];
  if (!task) {
    return null;
  }

  const [selectValue, setSelectValue] = useState<number | null>(null);

  useEffect(() => {
    if (selectValue) {
      const timeoutId = window.setTimeout(() => {
        if (selectValue === task.result) {
          correct();
        } else {
          incorrect();
        }
        setSelectValue(null);
      }, 1000);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [selectValue]);

  const clickHandler = (value: number) => {
    setSelectValue(value);
  };

  const buttons = task.choices.map((choice, index) => {
    let className;
    let disabled = false;
    if (selectValue) {
      disabled = true;

      if (choice.value == task.result) {
        className = "correct";
      } else {
        className = "incorrect";
      }
    }
    return (
      <div key={index}>
        <button
          className={className}
          disabled={disabled}
          onClick={() => clickHandler(choice.value)}
        >
          {choice.text}
        </button>
      </div>
    );
  });

  let result;
  if (selectValue) {
    if (selectValue === task.result) {
      result = <span className="correct">正解！</span>;
    } else {
      result = <span className="incorrect">不正解</span>;
    }
  }

  return (
    <div className="task">
      <p>
        <small>
          第{game.index + 1}問（{timeSeconds}秒）{result}
        </small>
      </p>
      <p className="text">{task.text}</p>
      <p className="value">{task.value}</p>
      {buttons}
    </div>
  );
};

const App: React.SFC<Props> = props => {
  const { game, correct, incorrect, start } = useGame();

  if (game.startedAt === null) {
    return <StartScreen game={game} start={start}></StartScreen>;
  } else if (game.endedAt) {
    return <ScoreScreen game={game} start={start}></ScoreScreen>;
  } else {
    return (
      <TaskScreen
        game={game}
        correct={correct}
        incorrect={incorrect}
      ></TaskScreen>
    );
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const element = document.querySelector<HTMLDivElement>("div#app");
  ReactDOM.render(<App />, element);
});
