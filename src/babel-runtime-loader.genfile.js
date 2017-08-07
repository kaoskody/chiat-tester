
import _ from 'lodash';
import fs from 'fs';
import {resolve} from 'path';

export default function genRuntime() {

  const babelDirectory = resolve(__dirname, '../node_modules/babel-runtime');

  let files = fs.readdirSync(babelDirectory);
  files.splice(files.indexOf('node_modules'), 1);
  files = digForDirectories(files, babelDirectory);

  files = files
      .map(file => file.substring(0, file.length - 3));

  const imports = files.map((file, index) => "import var" + index + ' from \'babel-runtime/' + file + '\';');
  const setters = files.map((file, index) => "babelRuntime['" + file + "'] = var" + index + ';');

  const content = [...imports, "const babelRuntime = {};", ...setters, "export default babelRuntime;"].join('\n');

  return {code: content};
}

function digForDirectories(filesAndDirectories, workingDirectory, prefix = '') {
  const [rawFilenames, otherFiles] = _.partition(filesAndDirectories, file => file.endsWith('.js'));
  const files = rawFilenames.map(file => prefix + file);
  const directories = otherFiles.filter(file => !file.includes('.'));
  return directories.reduce((files, directory) => {
    const currentWorkingDirectory = workingDirectory + '/' + directory;
    const directoryFiles = fs.readdirSync(currentWorkingDirectory);
    return files.concat(digForDirectories(directoryFiles, currentWorkingDirectory, prefix + directory + '/'));
  }, files);
}