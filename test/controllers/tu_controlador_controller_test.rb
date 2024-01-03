require "test_helper"

class TuControladorControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get tu_controlador_index_url
    assert_response :success
  end
end
