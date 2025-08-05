import { useState } from "react";
import "./styles.css";

export default function App() {
  const [stat1, setStat1Base] = useState(() => localStorage.getItem("stat1") ?? `Table '[dbo].[example]'. Scan count 1, logical reads 2403, physical reads 0, page server reads 0, read-ahead reads 0, page server read-ahead reads 0, lob logical reads 0, lob physical reads 0, lob page server reads 0, lob read-ahead reads 0, lob page server read-ahead reads 0.

(100 rows affected)`);
  const setStat1 = (v: string) => {
    localStorage.setItem("stat1", v);
    setStat1Base(v);
  };

  const [stat2, setStat2Base] = useState(() => localStorage.getItem("stat2") ?? "");
  const setStat2 = (v: string) => {
    localStorage.setItem("stat2", v);
    setStat2Base(v);
  };

  const cols = [
    "Scan count", "Logical reads", "Physical reads"
  ];
  const tables = [];
  const rows = { 'Totals': [], 'Totals (KB)': []};
  const totals = rows['Totals'];
  const totalsKb = rows['Totals (KB)'];
  const keys = [];
  
  function parseStats(s: string, key: string) {

    if (!keys.includes(key)) keys.push(key);

    s
    .split("\n")
    .filter((i) => i.startsWith("Table "))
    .forEach((i) => {
      // Table 'currency'. Scan count 0, logical reads 2, physical reads 0, page server reads 0, read-ahead reads 0, page server read-ahead reads 0, lob logical reads 0, lob physical reads 0, lob page server reads 0, lob read-ahead reads 0, lob page server read-ahead reads 0.
      const s = /^Table '(.*)'. (.*)$/.exec(i);
      if (!s) return;
      const t = s[1];
      const r = s[2];

      const row = rows[t] || (rows[t] = {});

      if (!tables.includes(t)) tables.push(t);

      for (let i of r.split(",")) {
        const x = /^\s*(.*) (\d+)$/.exec(i);
        if (!x) continue;
        let [_, t, vs] = x;

        let v = parseInt(vs);
        if (!v && t != "Scan count") continue

        let tt = t.trim();
        tt = tt[0].toUpperCase() + tt.substring(1);
        let ix = cols.indexOf(tt);
        if (ix == -1) {
          cols.push(tt);
          ix = cols.length - 1;
        }
        const rowi = row[ix] || (row[ix] = {});
        rowi[key] = v;

        totals[ix] ??= {};
        totalsKb[ix] ??= {};
        totals[ix][key] = (totals[ix][key] || 0) + v;
        if (t != "Scan count") totalsKb[ix][key] = (totalsKb[ix][key] || 0) + v * 8;
      }
    });
  }

  parseStats(stat1, "stat1");

  if (stat2)
    parseStats(stat2, "stat2");

  tables.push("Totals");
  tables.push('Totals (KB)');

  console.log(rows);

  const key0 = keys[0];

  return (
    <div className="App">
      <div style={{ display: "flex", gap: "1rem" }}>
        <textarea onChange={(ev) => setStat1(ev.currentTarget.value)} placeholder="Paste here the results of a query wrapped in SET STATISTICS IO ON">
          {stat1}
        </textarea>
        <textarea onChange={(ev) => setStat2(ev.currentTarget.value)} placeholder="Paste another query results here to compare">
          {stat2}
        </textarea>
      </div>

      <table border={1}>
        <thead>
          <tr>
            <td></td>
            {cols.map((i) => (
              <td colSpan={keys.length}>{i}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {tables.map((t, k) => {
            const r = rows[t];
            return (
              <tr key={k} className={t.startsWith("Total") ? "total" : ""}>
                <td>{t}</td>
                {cols.map((c, ck) => 
                  keys.map((key, ki) => {
                    const v = r?.[ck]?.[key];
                    let cls = '';
                    if (ki > 0) {
                      const b0 = r?.[ck]?.[key0];
                      if (!b0 && v) cls = `new`;
                      else if (v > b0) cls = `inc`;
                      else if (v < b0) cls = `dec`;
                    }
                    return (
                      <td className={`ar val val-${ki}`}>
                        <div className={cls}>
                          {fmt(v)}
                        </div>
                      </td>
                    );
                  })
                )}
              </tr>
            );
          })}
        </tbody>

        {/* <tfoot>
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
        </tfoot> */}

      </table>
    </div>
  );
}

function fmt(n: any): string {
  if (!n) return "";
  return n.toLocaleString();
}
