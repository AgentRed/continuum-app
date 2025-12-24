// Standard table styles matching CanonicalDocumentsPage pattern

export function getTableStyles(palette: any) {
  return {
    table: {
      backgroundColor: "transparent",
      tableLayout: "fixed" as const,
      width: "100%",
    },
    thead: {
      "& tr th": {
        borderRight: `1px solid ${palette.border}`,
        borderBottom: `1px solid ${palette.border}`,
      },
    },
    tbody: {
      "& tr td": {
        borderRight: `1px solid ${palette.border}`,
        borderBottom: `1px solid ${palette.border}`,
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
      "& tr:hover": {
        backgroundColor: "rgba(59, 130, 246, 0.1) !important",
        cursor: "pointer",
      },
    },
    th: {
      backgroundColor: palette.header,
      color: palette.text,
      borderColor: palette.border,
      fontWeight: 700,
      overflow: "hidden",
    },
    td: {
      borderColor: palette.border,
      color: palette.text,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  };
}


