import express from "express";
import {and, desc, eq, getTableColumns, ilike, or, sql} from "drizzle-orm";
import {departments, subjects} from "../db/schema/index.js";
import {db} from "../db/index.js";

const router = express.Router();

/*get all subject with optional search, filtering and pagination*/
router.get("/" , async (req , res) => {
    try {
        const {search , department , page = 1 , limit = 10} = req.query;

        const parsePositiveInt = (value: unknown, fallback: number) => {
            const parsed = Number.parseInt(String(value), 10);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
        };

        const currentPage = parsePositiveInt(page, 1);
        const limitPerPage = Math.min(100, parsePositiveInt(limit, 10));

        const offset = (currentPage - 1) * limitPerPage;
        const filterConditions = [];

        //if search query exists, filter subjects by subject name or subject code
        if(search){
            filterConditions.push(
                or(
                    ilike(subjects.name , `%${search}%`),
                    ilike(subjects.code , `%${search}%`),
                )
            );
        }
        //if department filter exists, match by department name
        if(department){
            const deptPattern = `%${String(department).replace(/[%_]/g, '\\$&')}%`;
            filterConditions.push(ilike(departments.name , deptPattern));
        }

        //combine all filters using and if any exist
        const whereClause = filterConditions.length > 0 ? and (...filterConditions) : undefined;

        const countResult = await db
            .select({count : sql<number>`count(*)`})
            .from(subjects)
            .leftJoin(departments , eq(subjects.departmentId , departments.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db
            .select({
                ...getTableColumns(subjects),
                department: { ...getTableColumns(departments)}
            }).from(subjects).leftJoin(departments , eq(subjects.departmentId , departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page : currentPage,
                limit : limitPerPage,
                total : totalCount,
                totalPages : Math.ceil(totalCount / limitPerPage),
            }
        })


    }catch (e) {
        console.error(`GET /subjects error: ${e}`);
        res.status(500).json({error : "Failed to fetch subjects"});
    }
})

export default router;