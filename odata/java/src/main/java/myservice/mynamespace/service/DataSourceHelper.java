package myservice.mynamespace.service;

import javax.sql.DataSource;

import com.mysql.cj.jdbc.MysqlDataSource;

public class DataSourceHelper {
    
    private static final String DB_NAME = "nwind";
    
    private static final String DB_USER = "equser";
    private static final String DB_PASSWORD = "ILoveEasyQuery";

    private static final int DB_PORT = 6603;

    private static final String DB_SERVERNAME = "demodb.korzh.com";

	public static DataSource createDataSource() {

        MysqlDataSource dataSource = new MysqlDataSource();
        dataSource.setUser(DB_USER);
        dataSource.setPassword(DB_PASSWORD);
        dataSource.setServerName(DB_SERVERNAME);
        dataSource.setPort(DB_PORT);
        dataSource.setDatabaseName(DB_NAME);
        
		return dataSource;
	}
}