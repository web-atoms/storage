import Assert from "@web-atoms/unit-test/dist/Assert";
import Test from "@web-atoms/unit-test/dist/Test";
import TestItem from "@web-atoms/unit-test/dist/TestItem";
import Query from "../../query/Query";

export default class QueryTest extends TestItem {

    @Test
    public test1() {
        const q = Query.create `A = ${2} AND B = ${3}`;
        Assert.equals("A = @p0 AND B = @p1", q.toQuery().command);
    }

    @Test
    public test2() {
        let filter = Query.fragments("WHERE ", " AND ");
        filter = filter.add `id = ${2}`;
        filter = filter.add `name = ${"a"}`;

        const q = Query.create `SELECT * FROM PRODUCTS ${filter}`;

        const query = q.toQuery();

        Assert.equals("SELECT * FROM PRODUCTS WHERE id = @p0 AND name = @p1", query.command);
    }

}
