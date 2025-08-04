import { useState } from "react";
import "./styles.css";

export default function App() {
  const [stat, setStat] = useState(`
  (1 row affected)
Table 'Worktable'. Scan count 3, logical reads 122, physical reads 0, page server reads 0, read-ahead reads 0, page server read-ahead reads 0, lob logical reads 20, lob physical reads 0, lob page server reads 0, lob read-ahead reads 0, lob page server read-ahead reads 0.
`);

  const cols = [];

  const totals = [];
  const totalsKb = [];

  const d = stat
    .split("\n")
    .filter((i) => i.startsWith("Table "))
    .map((i) => {
      // Table 'currency'. Scan count 0, logical reads 2, physical reads 0, page server reads 0, read-ahead reads 0, page server read-ahead reads 0, lob logical reads 0, lob physical reads 0, lob page server reads 0, lob read-ahead reads 0, lob page server read-ahead reads 0.
      const s = /^Table '(\w+)'. (.*)$/.exec(i);
      if (!s) return;
      const t = s[1];
      const r = s[2];
      const vals = [];

      for (let i of r.split(",")) {
        const x = /^\s*(.*) (\d+)$/.exec(i);
        if (!x) continue;
        let [_, t, vs] = x;

        let v = parseInt(vs);

        let ix = cols.indexOf(t);
        if (ix == -1) {
          cols.push(t);
          ix = cols.length - 1;
        }
        vals[ix] = v;

        totals[ix] = (totals[ix] || 0) + v;

        if (t.endsWith("reads")) totalsKb[ix] = (totalsKb[ix] || 0) + v * 8;
      }

      return { table: t, vals };
    })
    .filter((i) => i);

  console.log(d);

  return (
    <div className="App">
      <textarea onChange={(ev) => setStat(ev.currentTarget.value)}>
        {stat}
      </textarea>

      <table border="1">
        <thead>
          <tr>
            <td></td>
            {cols.map((i) => (
              <td>{i}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.map((i, k) => (
            <tr key={k}>
              <td>{i.table}</td>
              {cols.map((c, k) => (
                <td className="ar">{fmt(i.vals?.[k])}</td>
              ))}
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td>Total</td>
            {cols.map((i, k) => (
              <td className="ar">{fmt(totals[k])}</td>
            ))}
          </tr>
          <tr>
            <td>Total (KB)</td>
            {cols.map((i, k) => (
              <td className="ar">{fmt(totalsKb[k])}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function fmt(n: any): string {
  if (!n) return "";
  return n.toLocaleString();
}
