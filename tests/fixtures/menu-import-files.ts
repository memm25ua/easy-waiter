export type RepresentativeMenuFileType =
  | "pdf"
  | "png"
  | "jpg"
  | "jpeg"
  | "webp";

export interface RepresentativeMenuFile {
  id: string;
  fileName: string;
  fileType: RepresentativeMenuFileType;
  mimeType: string;
  sizeBytes: number;
  fixturePath: string;
  expectedLanguage: "en" | "es" | "mixed";
  notes: string[];
}

export const representativePdfMenu: RepresentativeMenuFile = {
  id: "fixture-menu-pdf",
  fileName: "demo-bistro-menu.pdf",
  fileType: "pdf",
  mimeType: "application/pdf",
  sizeBytes: 128_000,
  fixturePath: "tests/fixtures/files/demo-bistro-menu.pdf",
  expectedLanguage: "mixed",
  notes: [
    "multi-page menu",
    "prices visually separated from item names",
    "contains optional descriptions",
  ],
};

export const representativeImageMenu: RepresentativeMenuFile = {
  id: "fixture-menu-image",
  fileName: "sample-cantina-menu.jpg",
  fileType: "jpg",
  mimeType: "image/jpeg",
  sizeBytes: 84_000,
  fixturePath: "tests/fixtures/files/sample-cantina-menu.jpg",
  expectedLanguage: "es",
  notes: [
    "single image menu",
    "slightly rotated source",
    "contains promotional text that should not be orderable",
  ],
};

export const representativeMenuFiles = [
  representativePdfMenu,
  representativeImageMenu,
] as const;

export function getRepresentativeMenuFile(id: string) {
  return representativeMenuFiles.find((file) => file.id === id) ?? null;
}

export function createMockMenuUpload(file = representativePdfMenu) {
  return {
    name: file.fileName,
    type: file.mimeType,
    size: file.sizeBytes,
  };
}
