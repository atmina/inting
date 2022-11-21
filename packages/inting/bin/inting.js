const main = async () => {
  const cli = await import('../dist/cli.js');
  await cli.main();
}

void main();