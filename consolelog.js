import chalk from "chalk";

export const customErrorlog = (message) => {
  console.log(chalk.white.bgRed.bold(message));
};
export const customSuccesslog = (message) => {
  console.log(chalk.white.bgGreen.bold(message));
};
