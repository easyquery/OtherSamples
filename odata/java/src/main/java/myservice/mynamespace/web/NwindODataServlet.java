package myservice.mynamespace.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.sap.olingo.jpa.processor.core.api.JPAODataCRUDContextAccess;
import com.sap.olingo.jpa.processor.core.api.JPAODataCRUDHandler;

import org.apache.olingo.commons.api.ex.ODataException;

/**
 * This class represents a standard HttpServlet implementation.
 * It is used as main entry point for the web application that carries the OData service.
 * The implementation of this HttpServlet simply delegates the user requests to the ODataHttpHandler
 */
public class NwindODataServlet extends HttpServlet {

  private static final long serialVersionUID = 1L;

  @Override
  protected void service(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException, IOException {

    try {
		final JPAODataCRUDContextAccess serviceContext =
		(JPAODataCRUDContextAccess) getServletContext().getAttribute("ServiceContext");      
		new JPAODataCRUDHandler(serviceContext).process(req, resp);
	
	} catch (RuntimeException e) {
		throw new ServletException(e);
	} catch (ODataException e) {
		throw new ServletException(e);
	}
  }
}
