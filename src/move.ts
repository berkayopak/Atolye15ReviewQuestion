type File = {
  id: string;
  name: string;
};

type Folder = {
  id: string;
  name: string;
  files: Array<File>;
};

type List = Array<Folder>;

function findFolder(targetFolderId: string, list: List): Folder | undefined {
  const targetFolder = list.find((folder) => folder.id === targetFolderId);

  return targetFolder;
}

function findFolderByFileId(targetFileId: string, list: List): Folder | undefined {
  const targetFolder = list.find((folder) => folder.files.find((file) => file.id === targetFileId));

  return targetFolder;
}

function findFile(targetFileId: string, list: List): File | undefined {
  const targetFolder = findFolderByFileId(targetFileId, list);
  let targetFile;
  if (targetFolder) targetFile = targetFolder.files.find((file) => file.id === targetFileId);

  return targetFile;
}

function addFile(newFile: File, files: Array<File>, immutable = true): Array<File> {
  let updatedFiles = files;

  if (immutable) {
    updatedFiles = [...files, newFile];
  } else {
    updatedFiles.push(newFile);
  }

  return updatedFiles;
}

function removeFile(targetFileId: string, files: Array<File>, immutable = true): Array<File> {
  let updatedFiles = files;

  if (immutable) {
    updatedFiles = files.filter((file) => file.id !== targetFileId);
  } else {
    const TARGET_INDEX = files.map((file) => file.id).indexOf(targetFileId);

    updatedFiles = files.splice(TARGET_INDEX, 1);
  }
  return updatedFiles;
}

export default function move(
  list: List,
  source: string,
  destination: string,
  immutable = true,
): List {
  let targetList = list;

  if (immutable) targetList = JSON.parse(JSON.stringify(list)) as List; // Deep Copy for basic objects

  const destinationFolder = findFolder(destination, targetList);
  const sourceFolder = findFolderByFileId(source, targetList);
  const sourceFile = findFile(source, targetList);

  if (destinationFolder) {
    if (sourceFolder && sourceFile) {
      if (destinationFolder.id !== sourceFolder.id) {
        if (immutable) {
          // If processes are immutable, it can no direct-effect on object. So you need to do an assigment.
          // It would be great for more secure processes, and decreases the bug chance
          destinationFolder.files = addFile(sourceFile, destinationFolder.files, immutable);
          sourceFolder.files = removeFile(source, sourceFolder.files, immutable);
        } else {
          // If processes are mutable, it can  direct-effect on object, so no need to assignment
          // But this approach could be create bugs, it needs to be careful
          // This example is not complex for now. So, mutable processes will not create bugs this time but
          // when functionality improves and it's more complex, it could create issues & bugs
          addFile(sourceFile, destinationFolder.files, immutable);
          removeFile(source, sourceFolder.files, immutable);
        }
      } else {
        throw Error('Source folder and destination folder can not be same');
      }
    } else if (findFolder(source, targetList)) {
      throw Error('You cannot move a folder');
    } else {
      throw Error('Source file not found');
    }
  } else if (findFile(destination, targetList)) {
    throw Error('You cannot specify a file as the destination');
  } else {
    throw Error('Destination folder not found');
  }

  return targetList;
  // TODO: Could be logging wrapper on higher order. After logging,
  //  if there is an error it could return unchanged list(deep copy required, otherwise it creates bug).
  //  But of course, it could be different depends on system architecture.
}
