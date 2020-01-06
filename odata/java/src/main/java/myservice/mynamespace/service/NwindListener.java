package myservice.mynamespace.service;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import javax.sql.DataSource;

import org.apache.olingo.commons.api.ex.ODataException;

import com.sap.olingo.jpa.processor.core.api.JPAODataCRUDContextAccess;
import com.sap.olingo.jpa.processor.core.api.JPAODataServiceContext;

public class NwindListener implements ServletContextListener {

  private static final String PUNIT_NAME = "Nwind";

  // Create Service Context
  @Override
  public void contextInitialized(ServletContextEvent sce) {
    final DataSource ds = DataSourceHelper.createDataSource();
    try {
      final JPAODataCRUDContextAccess serviceContext = JPAODataServiceContext.with()
          .setPUnit(PUNIT_NAME)
          .setDataSource(ds)
          .setTypePackage("myservice.mynamespace.model")
          .build();
      sce.getServletContext().setAttribute("ServiceContext", serviceContext);
    } catch (ODataException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public void contextDestroyed(ServletContextEvent sce) {
    sce.getServletContext().setAttribute("ServiceContext", null);
  }
}