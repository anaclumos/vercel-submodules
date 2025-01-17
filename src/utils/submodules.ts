import * as zx from 'zx';

export type Submodule = {
  commitHash: string;
  path: string;
  url: string;
};

export const fetchSubmodules = async (): Promise<Submodule[]> => {
  const output = await zx.$`git submodule status --recursive`;

  const submodules = await Promise.all(
    output.stdout
      .split('\n')
      .flatMap((rawLine) => {
        const line = rawLine.trim();
        if (line.length > 0) {
          return line;
        }
        return [];
      })
      .map(async (line) => {
        let [commitHash, path] = line.split(' ');
        if (commitHash.startsWith('-')) {
          commitHash = commitHash.slice(1);
        }
        const url =
          await zx.$`git config --file .gitmodules --get submodule.${path}.url`.then(
            (output) => output.stdout.trim(),
          );
        return { commitHash, path, url };
      }),
  );

  return submodules;
};
