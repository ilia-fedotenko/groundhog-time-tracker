import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@groundhog/ui"

export default function HistoryPage() {
  return (
    <div className="flex h-screen flex-col bg-background px-3 py-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>today</TableHead>
            <TableHead></TableHead>
            <TableHead>4:00:00</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Task 2</TableCell>
            <TableCell>2</TableCell>
            <TableCell>1:45:01</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Task 1</TableCell>
            <TableCell>4</TableCell>
            <TableCell>2:14:59</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
